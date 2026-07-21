import { Inject, Injectable, NotFoundException  , BadRequestException, UnauthorizedException} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { TeacherRepository } from "./teacher.repository";
import { Teacher } from "./interfaces/teacher.interface";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import * as bcrypt from "bcryptjs";
import { savePendingAdmin,getPendingAdmin,deletePendingAdmin } from "src/auth/otp-store";
import { sendOtpEmail } from "src/config/mail.config";
import { VerifyOtpDto } from "src/auth/dto/verify-otp.dto";
import { SendOtpDto } from "src/auth/dto/login-admin.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { generateRandomPassword } from "src/auth/otp-store";

const DOC_PREFIX = "teacher::";
 
@Injectable()
export class TeacherService {
  constructor(
    private readonly teachRepo: TeacherRepository,
  
  ) {}

  /** CREATE - add a new teacher document */
  async createTeacher(dto: CreateTeacherDto): Promise<Teacher> {

    const teacher=await this.teachRepo.findTeacherByemail(dto.email);
    if(teacher){
      throw  new  BadRequestException("Email already exists")
    }
    const id = uuidv4();
    const password = generateRandomPassword();
    const hashedPass=await bcrypt.hash(password,10)
    const docId = DOC_PREFIX + id;
    const newTeacher: Teacher = {
      id,
      meta_id:docId,
      name:dto.name,
      username:dto.username,
      password:hashedPass,
      email:dto.email,
      subject:dto.subject,
      phone:dto.phone,
      };
    await this.teachRepo.create(newTeacher);
    return newTeacher;
  }

  async sendChangePasswordOtp(dto: SendOtpDto) {
  const teacher = await this.teachRepo.findTeacherByemail(dto.email);

  if (!teacher) {
    throw new NotFoundException("Teacher not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
   console.log("Teacher otp:" +otp);
   
  
  savePendingAdmin(dto.email, {
    name: teacher.name,
    username: teacher.username,
    email: teacher.email,
    passwordHash: teacher.password,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  await sendOtpEmail(dto.email, otp);

  return {
    message: "OTP sent successfully",
  };
}

  async changePw(dto:ChangePasswordDto):Promise<{message:string}>{
    
   const pending = getPendingAdmin(dto.email);

  if (!pending) {
    throw new BadRequestException("OTP not found");
  }

  if (pending.expiresAt < Date.now()) {
    deletePendingAdmin(dto.email);
    throw new BadRequestException("OTP expired");
  }

  if (pending.otp !== Number(dto.otp)) {
    throw new BadRequestException("Invalid OTP");
  }

  if (dto.newPassword !== dto.confirmPassword) {
    throw new BadRequestException("Passwords do not match");
  }
     
   //check email is already there or not 
    const teacher=await this.teachRepo.findTeacherByemail(dto.email);
    if(!teacher){
      throw new NotFoundException("Teacher not found");
    }

    // check the password 
    const passwordMatch=(dto.currentPassword===teacher.password);
    if(!passwordMatch){
      throw new UnauthorizedException("Invalid email or password")
    }
    if(dto.newPassword !==dto.confirmPassword){
      throw new BadRequestException("New password and confirm password do not match");
    }
      const newPasswordHash=await bcrypt.hash(dto.newPassword,10);

      const updatedTeacher:Teacher={
        ...teacher,password:newPasswordHash};

      await this.teachRepo.updatePW(updatedTeacher);
    return {message:"Teacher verified and registered successfully and Password changed Successfully",
      
    }

  }
//get teacher by id
 async findOne(id: string): Promise<Teacher> {
  const teacher = await this.teachRepo.findById(id);

  if (!teacher) {
    throw new NotFoundException(
      `Teacher with id ${id} not found`,
    );
  }

  return teacher;
}
  /** GET ALL */
  async findAll(): Promise<Teacher[]> {
    return await this.teachRepo.findAll();
  }

  /** UPDATE */
  async update(
    id: string,
    dto: UpdateTeacherDto,
  ): Promise<Teacher> {

    const existing = await this.teachRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Teacher with id ${id} not found`,
      );
    }

    const updatedTeacher: Teacher = {
      ...existing,
      ...dto,
      id,
    };

    await this.teachRepo.update(id, updatedTeacher);

    return updatedTeacher;
  }

  /** DELETE */
  async remove(
    id: string,
  ): Promise<{ message: string }> {

    const existing = await this.teachRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Teacher with id ${id} not found`,
      );
    }

    await this.teachRepo.remove(id);

    return {
      message: "Teacher deleted successfully",
    };
  }














}

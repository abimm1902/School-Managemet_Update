import { Inject, Injectable, NotFoundException , BadRequestException ,UnauthorizedException} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import { Student } from "./interfaces/student.interface";
import { CreateStudentDto } from "./dto/create-student.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { StudentRepository } from "./student.repository";
import { SendOtpDto } from "src/auth/dto/login-admin.dto";
import { savePendingAdmin,getPendingAdmin,deletePendingAdmin } from "src/auth/otp-store";
import { sendOtpEmail } from "src/config/mail.config";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { generateRandomPassword } from "src/auth/otp-store";
const DOC_PREFIX = "student::";


@Injectable()
export class StudentService {
  constructor(
    @Inject()
    private readonly studentRepo: StudentRepository) {}

   /** CREATE - add a new teacher document */
    async createStudent(dto: CreateStudentDto): Promise<Student> {
  
      const student=await this.studentRepo.findStudentByemail(dto.email);
      if(student){
        throw  new  BadRequestException("Email already exists")
      }
      const id = uuidv4();
      const otp = Math.floor(100000 + Math.random() * 900000);
      const password = generateRandomPassword();
      const hashedPass=await bcrypt.hash(password,10)
      const docId = DOC_PREFIX + id;
      const newStudent: Student = {
        id,
        meta_id:docId,
        name:dto.name,
        username:dto.username,
        password:hashedPass,
        email:dto.email,
        className:dto.className,
        age:dto.age
        };
      await this.studentRepo.create(newStudent);
      return newStudent;
    }
  
    async sendChangePasswordOtp(dto: SendOtpDto) {
    const student = await this.studentRepo.findStudentByemail(dto.email);
  
    if (!student) {
      throw new NotFoundException("Student not found");
    }
  
    const otp = Math.floor(100000 + Math.random() * 900000);
     console.log("Student otp:" + otp);
     
    
    savePendingAdmin(dto.email, {
      name: student.name,
      username: student.username,
      email: student.email,
      passwordHash: student.password,
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
      const student=await this.studentRepo.findStudentByemail(dto.email);
      if(!student){
        throw new NotFoundException("student not found");
      }
  
      // check the password 
      const passwordMatch=(dto.currentPassword===student.password);
      if(!passwordMatch){
        throw new UnauthorizedException("Invalid email or password")
      }
      if(dto.newPassword !==dto.confirmPassword){
        throw new BadRequestException("New password and confirm password do not match");
      }
        const newPasswordHash=await bcrypt.hash(dto.newPassword,10);
  
        const updatedStudent:Student={
          ...student,password:newPasswordHash};
  
        await this.studentRepo.updatePW(updatedStudent);
      return {message:"Student verified and registered successfully and Password changed Successfully",
        
      }
  
    }

    async findOne(id: string): Promise<Student> {
  const student = await this.studentRepo.findById(id);

  if (!student) {
    throw new NotFoundException(
      `Student with id ${id} not found`,
    );
  }

  return student;
}

  /** GET ALL */
  async findAll(): Promise<Student[]> {
    return await this.studentRepo.findAll();
  }

  /** UPDATE */
  async update(
    id: string,
    dto: UpdateStudentDto,
  ): Promise<Student> {

    const existing = await this.studentRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Student with id ${id} not found`,
      );
    }

    const updatedStudent: Student = {
      ...existing,
      ...dto,
      id,
    };

    await this.studentRepo.update(id, updatedStudent);

    return updatedStudent;
  }

  /** DELETE */
  async remove(
    id: string,
  ): Promise<{ message: string }> {

    const existing = await this.studentRepo.findById(id);

    if (!existing) {
      throw new NotFoundException(
        `Student with id ${id} not found`,
      );
    }

    await this.studentRepo.remove(id);

    return {
      message: "Student deleted successfully",
    };
  }
}
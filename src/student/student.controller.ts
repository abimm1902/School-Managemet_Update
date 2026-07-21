import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from "@nestjs/common";
import { StudentService } from "./student.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { SendOtpDto } from "src/auth/dto/login-admin.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdminOnlyGuard } from "src/auth/roles.guards";

@Controller("students")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  // Admin-only: requires a valid admin JWT (Authorization: Bearer <token>)
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)

 @Post("login")
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.createStudent(dto);
  }

  @Post("send-otp")
sendOtp(@Body() dto: SendOtpDto) {
  return this.studentService.sendChangePasswordOtp(dto);
}

@Post("change-password")
changePassword(@Body() dto: ChangePasswordDto) {
  return this.studentService.changePw(dto);
}

//get the student by id
@Get(":id")
  findOne(@Param("id") id: string) {
    return this.studentService.findOne(id);
  }
// get all student
  @Get()
  findAll() {
    return this.studentService.findAll();
  }

  //update the student
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  //delete the student
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.studentService.remove(id);
  }
}

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
import { TeacherService } from "./teacher.service";
import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { ChangePasswordDto } from "src/auth/dto/change-password.dto";
import { VerifyOtpDto } from "src/auth/dto/verify-otp.dto";
import { SendOtpDto } from "src/auth/dto/login-admin.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdminOnlyGuard } from "src/auth/roles.guards";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";


@Controller("teachers")
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

// Admin-only: requires a valid admin JWT (Authorization: Bearer <token>)
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  
  @Post("login")
  create(@Body() dto: CreateTeacherDto) {
    return this.teacherService.createTeacher(dto);
  }

  @Post("send-otp")
sendOtp(@Body() dto: SendOtpDto) {
  return this.teacherService.sendChangePasswordOtp(dto);
}

@Post("change-password")
changePassword(@Body() dto: ChangePasswordDto) {
  return this.teacherService.changePw(dto);
}


//get the student by id
@Get(":id")
  findOne(@Param("id") id: string) {
    return this.teacherService.findOne(id);
  }
// get all student
  @Get()
  findAll() {
    return this.teacherService.findAll();
  }

  //update the student
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTeacherDto) {
    return this.teacherService.update(id, dto);
  }

  //delete the student
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.teacherService.remove(id);
  }





















 }

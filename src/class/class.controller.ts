import {  Body,  Controller,  Delete,  Get,  Param,  Post, Put, UseGuards,} from "@nestjs/common";
import { ClassService } from "./class.service";
import { CreateClassDto, CreateSectionDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";
import { AssignStudentDto } from "./dto/assign-student.dto";
import { AssignTeacherDto } from "./dto/assign-teacher.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { AdminOnlyGuard } from "src/auth/roles.guards";
import { UpdateSectionDto } from "./dto/update-class.dto";


@Controller("classes")
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // Admin-only: create a new class (e.g. "Class 7")
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }

  // Admin-only: add a section (e.g. "A") to a class
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post(":id/sections")
  addSection(@Param("id") id: string, @Body() dto: CreateSectionDto) {
    return this.classService.addSection(id, dto);
  }


  // Admin-only: assign a student to a class + section
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post(":id/students")
  assignStudent(@Param("id") id: string, @Body() dto: AssignStudentDto) {
    return this.classService.assignStudent(id, dto);
  }

  // Admin-only: remove a student from a section
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id/sections/:sectionId/students/:studentId")
  removeStudent(
    @Param("id") id: string,
    @Param("sectionId") sectionId: string,
    @Param("studentId") studentId: string
  ) {
    return this.classService.removeStudent(id, sectionId, studentId);
  }

  // Admin-only: assign a teacher to a class + section
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Post(":id/teachers")
  assignTeacher(@Param("id") id: string, @Body() dto: AssignTeacherDto) {
    return this.classService.assignTeacher(id, dto);
  }

  @Get()
  findAll() {
    return this.classService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.classService.findOne(id);
  }

  // Admin-only: rename a class
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() dto: UpdateClassDto) {
    return this.classService.update(id, dto);
  }

  // Admin-only: delete a class
  @UseGuards(JwtAuthGuard, AdminOnlyGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.classService.remove(id);
  }
}

import { Module } from "@nestjs/common";
import { TeacherController } from "./teacher.controller";
import { TeacherService } from "./teacher.service";
import { TeacherRepository } from "./teacher.repository";

@Module({
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
})
export class TeacherModule {}

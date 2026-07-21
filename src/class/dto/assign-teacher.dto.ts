import { IsNotEmpty, IsString } from "class-validator";

export class AssignTeacherDto {
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @IsString()
  @IsNotEmpty()
  teacherId!: string;
}

import { IsNotEmpty, IsString } from "class-validator";

export class AssignStudentDto {
  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string;
}

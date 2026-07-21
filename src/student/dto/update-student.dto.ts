import { IsEmail, IsNumber, IsString } from "class-validator";

export class UpdateStudentDto {

  @IsString()
  name?: string;

  @IsNumber()
  age?: number;

  @IsString()
  className?: string;

  @IsEmail()
  email?: string;
}

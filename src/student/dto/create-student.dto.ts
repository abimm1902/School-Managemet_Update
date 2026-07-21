import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateStudentDto {
  @IsString()
  name!: string;

  @IsNumber()
  age!: number;
  
  @IsString()
  username!:string;
  
  @IsString()
  className!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password?:string;
 


}

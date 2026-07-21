import { IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";


export class CreateTeacherDto {

  @IsString()
  name!: string;
  
  @IsString()
  subject!: string;
  
  @IsString()
  email!: string;
  
  @IsNumber()
  @MinLength(10)
  phone!: number;

  @IsString()
  username!:string
}

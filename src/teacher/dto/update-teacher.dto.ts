import { IsEmail, IsNumber, IsString , MinLength } from "class-validator";

export class UpdateTeacherDto {

  @IsString()
  name?: string;
  
  @IsString()
 password?: string;
  
     @IsEmail()
    email?:string;

    @IsNumber()
      @MinLength(10)
    phone?:number

     @IsString()
      subject!: string;
      
    
      @IsString()
      username!:string
}

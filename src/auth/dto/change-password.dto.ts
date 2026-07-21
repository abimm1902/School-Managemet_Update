import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  currentPassword!: string;
  
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
  
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword!: string;

  @IsNumber()
  otp?:number

}




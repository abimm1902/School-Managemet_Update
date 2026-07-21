import { IsEmail, IsNumber, IsString } from "class-validator";

export class VerifyOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  username!: string;


  @IsNumber()
  otp!: number;
}

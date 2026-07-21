import { IsEmail, IsString, MinLength, } from "class-validator";

export class SignupAdminDto {
  @IsString()
  name!: string;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(6)
  @IsString()
  password!: string;
}

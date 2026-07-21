import {IsEmail,IsNotEmpty,IsString,MinLength,} from 'class-validator';

export class LoginAdminDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class SendOtpDto {
  @IsEmail()
  email!: string;
}

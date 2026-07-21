import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupAdminDto } from "./dto/signup-admin.dto";
import {  LoginAdminDto } from "./dto/login-admin.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() dto: SignupAdminDto) {
    return this.authService.signup(dto);
  }

  @Post("verify-otp")
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginAdminDto) {
    return this.authService.login(dto);
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }
  
}

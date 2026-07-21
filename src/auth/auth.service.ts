import { BadRequestException, Inject, Injectable, UnauthorizedException,} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import {COUCHBASE_CONNECTION,CouchbaseConnection, couchbaseBucketName,} from "../config/couchbase.connection";
import { sendOtpEmail } from "../config/mail.config";
import { savePendingAdmin,  getPendingAdmin, deletePendingAdmin,} from "./otp-store";
import { Admin } from "./interfaces/admin.interface";
import { SignupAdminDto } from "./dto/signup-admin.dto";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AuthRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";
 

const DOC_PREFIX = "admin::";
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService:JwtService,  ) {}

  async signup(dto: SignupAdminDto): Promise<{ message: string }> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);

    console.log("Generated OTP:", otp);

    savePendingAdmin(dto.email, {
      name: dto.name,
      username: dto.username,
      email: dto.email,
      passwordHash,
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
  
    await sendOtpEmail(dto.email, otp);

    return { message: "OTP sent to your email. Please verify to complete signup." };
  }



  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string; admin: Omit<Admin, "passwordHash"> }> {
    const pending = getPendingAdmin(dto.email);
    if (!pending) {
      throw new BadRequestException("No pending signup found for this email");
    }
    console.log("Pending Admin:", pending);

    if (Date.now() > pending.expiresAt) {
      deletePendingAdmin(dto.email);
      throw new BadRequestException("OTP expired, please sign up again");
    }

    if (pending.otp !== Number(dto.otp)) {
      throw new BadRequestException("Invalid OTP");
    }
    const id = uuidv4();
    const docId = DOC_PREFIX + id;
    const newAdmin: Admin = {
      meta_Id: docId,
      id,
      name: pending.name,
      username: pending.username,
      email: pending.email,
      passwordHash: pending.passwordHash,
    };

    await this.authRepository.create(newAdmin);
    deletePendingAdmin(dto.email);
  
    return {
      message: "Admin verified and registered successfully",
      admin: { meta_Id: newAdmin.meta_Id, id: newAdmin.id, name: newAdmin.name, username: newAdmin.username, email: newAdmin.email,  },
    };
  }

  // LOGIN - verify password using bcrypt.compare 
  async login(dto: LoginAdminDto) {
    const admin = await this.authRepository.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }
    const payload = { sub: admin.id, email: admin.email, role: admin.username };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: "Login successful",
      accessToken,
      tokenType: "Bearer",
      admin: { id: admin.id, name: admin.name, username: admin.username, email: admin.email },
    };
  }
  
async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
    const admin = await this.authRepository.findByEmail(dto.email);
    if (!admin) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      admin.passwordHash
    );
    if (!currentPasswordMatches) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException("New password and confirm password do not match");
    } 

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
  
    const updatedAdmin: Admin = { ...admin, passwordHash: newPasswordHash };

    await this.authRepository.update(updatedAdmin);

    return { message: "Password changed successfully" };
  }

}




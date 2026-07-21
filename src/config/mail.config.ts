import * as nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});
// Sends a 6-digit OTP to the given email address. 
export async function sendOtpEmail(toEmail: string, otp: number): Promise<void> {
  await transporter.sendMail({
    from: email,
    to: toEmail,
    subject: "OTP Verification - School Management",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
}

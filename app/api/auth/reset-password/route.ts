import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashOtp, verifyOtp } from "@/lib/otp";
import { z } from "zod";
import { handleApiError } from "@/lib/utils";

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, password } = ResetPasswordSchema.parse(body);

    // Find the active, unexpired reset OTP for this email
    const otpRecord = await prisma.verificationOtp.findFirst({
      where: {
        email,
        purpose: "forgot_password",
        used_at: null,
        expires_at: { gte: new Date() },
      },
      orderBy: { created_at: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not found or expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.attempt_count >= 5) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new OTP." },
        { status: 429 }
      );
    }

    const valid = await verifyOtp(otp, otpRecord.otp_hash);
    if (!valid) {
      await prisma.verificationOtp.update({
        where: { id: otpRecord.id },
        data: { attempt_count: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // Update password, verify the email (OTP proves ownership), and consume the OTP atomically
    const hashedPassword = await hashOtp(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: otpRecord.user_id },
        data: { password_hash: hashedPassword, email_verified_at: new Date() },
      }),
      prisma.verificationOtp.update({
        where: { id: otpRecord.id },
        data: { used_at: new Date() },
      }),
    ]);

    return NextResponse.json({
      message: "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

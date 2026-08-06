import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashOtp } from "@/lib/otp";
import { z } from "zod";
import { handleApiError } from "@/lib/utils";

const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = ResetPasswordSchema.parse(body);

    // Find and verify OTP
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

    // Update password
    const hashedPassword = await hashOtp(password);
    await prisma.user.update({
      where: { email },
      data: { password_hash: hashedPassword },
    });

    // Mark OTP as used
    await prisma.verificationOtp.update({
      where: { id: otpRecord.id },
      data: { used_at: new Date() },
    });

    return NextResponse.json({
      message: "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

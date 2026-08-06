// app/api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { handleApiError } from "@/lib/utils";

const VerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["email_verification", "forgot_password"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, purpose } = VerifySchema.parse(body);

    const otpRecord = await prisma.verificationOtp.findFirst({
      where: {
        email,
        purpose,
        used_at: null,
        expires_at: { gte: new Date() },
      },
      orderBy: { created_at: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json({ error: "OTP not found or expired" }, { status: 400 });
    }

    if (otpRecord.attempt_count >= 5) {
      return NextResponse.json({ error: "Maximum verification attempts exceeded" }, { status: 429 });
    }

    const valid = await verifyOtp(otp, otpRecord.otp_hash);
    if (!valid) {
      await prisma.verificationOtp.update({
        where: { id: otpRecord.id },
        data: { attempt_count: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await prisma.verificationOtp.update({
      where: { id: otpRecord.id },
      data: { used_at: new Date() },
    });

    if (purpose === "email_verification") {
      await prisma.user.update({
        where: { email },
        data: { email_verified_at: new Date() },
      });
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}

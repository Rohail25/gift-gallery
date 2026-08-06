// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RegisterSchema } from "@/validators/auth";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendMail } from "@/lib/email";
import { handleApiError } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        full_name: data.fullName,
        email: data.email,
        password_hash: await hashOtp(data.password),
        role: "CUSTOMER",
        auth_provider: "credentials",
        status: "active",
      },
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationOtp.create({
      data: {
        user_id: user.id,
        email: user.email,
        purpose: "email_verification",
        otp_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    await sendMail({
      to: user.email,
      subject: "Gift Gallery – Email Verification OTP",
      html: `<h2>Your Gift Gallery Verification Code</h2><p>Use code: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    return NextResponse.json({ message: "Verification OTP sent" }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

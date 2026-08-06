import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateOtp, hashOtp, getOtpExpiry } from "@/lib/otp";
import { sendMail, emailTemplates } from "@/lib/email";
import { z } from "zod";
import { handleApiError } from "@/lib/utils";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, return generic message
      return NextResponse.json({
        message: "If email exists, OTP will be sent shortly",
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    // Store OTP
    await prisma.verificationOtp.create({
      data: {
        user_id: user.id,
        email: user.email,
        purpose: "forgot_password",
        otp_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    // Send email
    const template = emailTemplates.forgotPasswordOtp(otp, user.full_name);
    await sendMail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({
      message: "If email exists, OTP will be sent shortly",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

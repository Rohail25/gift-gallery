import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

/**
 * Additional authentication routes
 */

export async function PUT(req: Request) {
  try {
    const { email, otp, purpose } = await req.json();

    // This route is handled by verify-otp endpoint
    return NextResponse.json(
      { error: "Use /api/auth/verify-otp for OTP verification" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }
}

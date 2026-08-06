import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoginSchema } from "@/validators/auth";
import { handleApiError } from "@/lib/utils";
import { signIn } from "next-auth/react";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = LoginSchema.parse(body);

    // This endpoint would be handled by NextAuth credentials provider
    // We return a proper response for the frontend
    return NextResponse.json({
      message: "Use the standard NextAuth login endpoint at /api/auth/signin",
      url: "/api/auth/signin",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

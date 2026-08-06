import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { hashOtp, verifyOtp } from "@/lib/otp";
import { z } from "zod";

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER", "DECOR_MANAGER"];

const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    confirm_password: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !ADMIN_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!user.password_hash) {
      return NextResponse.json(
        { error: "Your account has no password set. Use 'Forgot Password' to create one first." },
        { status: 400 }
      );
    }

    const body = ChangePasswordSchema.parse(await req.json());

    const valid = await verifyOtp(body.current_password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hashOtp(body.new_password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash },
    });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

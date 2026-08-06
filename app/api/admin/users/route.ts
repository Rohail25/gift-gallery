import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { z } from "zod";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { generateOtp, hashOtp, getOtpExpiry } from "@/lib/otp";
import { sendMail, emailTemplates } from "@/lib/email";

const InviteUserSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "SHOP_MANAGER", "RIDER", "DECOR_MANAGER", "DECOR_STAFF", "CUSTOMER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { full_name, email, role } = InviteUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        role,
        auth_provider: "credentials",
        status: "active",
      },
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    await prisma.verificationOtp.create({
      data: {
        user_id: user.id,
        email: user.email,
        purpose: "forgot_password",
        otp_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    const template = emailTemplates.inviteUser(full_name, email, otp);
    await sendMail({
      to: user.email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json(
      { message: "User invited successfully", data: user },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && role !== "all") where.role = role as UserRole;
    if (status && status !== "all") where.status = status as UserStatus;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          email_verified_at: true,
          last_login_at: true,
          created_at: true,
          _count: {
            select: {
              orders: true,
              bookings: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const body = await req.json();

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json({ message: "User updated", data: user });
  } catch (error) {
    return handleApiError(error);
  }
}
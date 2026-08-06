import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { Prisma, UserStatus } from "@prisma/client";

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER"];

async function requireAdmin() {
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

  return user;
}

export async function GET(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: Prisma.UserWhereInput = { role: "RIDER" };
    if (status && status !== "all") where.status = status as UserStatus;
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const page = pageParam ? parseInt(pageParam) : null;
    const riders = await prisma.user.findMany({
      where,
      include: {
        riderProfile: true,
        _count: {
          select: {
            riderAssignments: {
              where: { status: { in: ["assigned", "accepted", "picked_up"] } },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      ...(page !== null ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    if (page === null) {
      return NextResponse.json({ data: riders });
    }

    const total = await prisma.user.count({ where });

    return NextResponse.json({
      data: riders,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rider ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { availability_status, status } = body;

    const rider = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!rider || rider.role !== "RIDER") {
      return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (availability_status) {
        await tx.riderProfile.upsert({
          where: { user_id: rider.id },
          update: { availability_status },
          create: { user_id: rider.id, availability_status },
        });
      }

      return tx.user.update({
        where: { id: rider.id },
        data: status ? { status } : {},
        include: { riderProfile: true },
      });
    });

    return NextResponse.json({ message: "Rider updated", data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

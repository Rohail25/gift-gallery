import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unread") === "true";

    const where: any = { user_id: user.id };
    if (unreadOnly) {
      where.read_at = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { user_id: user.id, read_at: null },
      }),
    ]);

    return NextResponse.json({
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        unreadCount,
      },
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { notificationId, markAllRead } = await req.json();

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { user_id: user.id, read_at: null },
        data: { read_at: new Date() },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read_at: new Date() },
      });
    }

    return NextResponse.json({ message: "Notifications updated" });
  } catch (error) {
    return handleApiError(error);
  }
}
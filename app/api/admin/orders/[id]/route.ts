import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "SHOP_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
        delivery_zone: true,
        delivery_address: true,
        items: true,
        payments: true,
        status_history: {
          include: { changed_by_user: { select: { full_name: true } } },
          orderBy: { created_at: "desc" },
        },
        orderRiderAssignments: {
          include: {
            rider_user: {
              select: { full_name: true, phone: true },
            },
          },
          orderBy: { assigned_at: "desc" },
        },
        deliveryOtps: {
          select: {
            id: true,
            expires_at: true,
            attempt_count: true,
            verified_at: true,
            invalidated_at: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    return handleApiError(error);
  }
}

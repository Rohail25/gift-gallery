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

    const target = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        addresses: { where: { is_active: true }, orderBy: { is_default: "desc" } },
        riderProfile: true,
        _count: {
          select: {
            orders: true,
            productReviews: true,
            bookings: true,
            carts: true,
          },
        },
      },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [recentOrders, recentBookings, recentReviews] = await Promise.all([
      prisma.order.findMany({
        where: { user_id: target.id },
        orderBy: { created_at: "desc" },
        take: 10,
        include: { delivery_zone: { select: { name: true } } },
      }),
      prisma.decorBooking.findMany({
        where: { user_id: target.id },
        orderBy: { created_at: "desc" },
        take: 10,
        include: {
          decor_package: { select: { name: true } },
          event_type: { select: { name: true } },
        },
      }),
      prisma.productReview.findMany({
        where: { user_id: target.id },
        orderBy: { created_at: "desc" },
        take: 10,
        include: { product: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      data: {
        ...target,
        recent_orders: recentOrders,
        recent_bookings: recentBookings,
        recent_reviews: recentReviews,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { sendDeliveryOtpEmail } from "@/lib/delivery-otp";

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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.order_status === "delivered") {
      return NextResponse.json({ error: "Order is already delivered" }, { status: 400 });
    }

    await sendDeliveryOtpEmail({
      id: order.id,
      user_id: order.user_id,
      order_number: order.order_number,
      grand_total: order.grand_total,
      user: { email: order.user.email, full_name: order.user.full_name },
    });

    return NextResponse.json({
      message: "Delivery OTP sent to customer email",
      data: { sent_at: new Date().toISOString() },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

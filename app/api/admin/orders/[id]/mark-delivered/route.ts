import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { Prisma } from "@prisma/client";

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

    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.order_status === "delivered") {
      return NextResponse.json({ message: "Order already delivered" });
    }

    const data: Prisma.OrderUpdateInput = {
      order_status: "delivered",
      delivered_at: new Date(),
      payment_status: "paid",
    };

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: existingOrder.id },
        data,
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          changed_by_user_id: admin.id,
          previous_status: existingOrder.order_status,
          new_status: "delivered",
          note: "Marked as delivered by admin",
        },
      });

      await tx.orderRiderAssignment.updateMany({
        where: { order_id: order.id, completed_at: null },
        data: { status: "completed", completed_at: new Date() },
      });

      // Delivery OTPs no longer needed once delivered
      await tx.deliveryOtp.updateMany({
        where: { order_id: order.id, verified_at: null, invalidated_at: null },
        data: { invalidated_at: new Date() },
      });

      const existingPayment = await tx.payment.findFirst({
        where: { order_id: order.id, status: "paid" },
      });

      if (!existingPayment) {
        await tx.payment.create({
          data: {
            order_id: order.id,
            payment_method: existingOrder.payment_method,
            amount: existingOrder.grand_total,
            currency: "PKR",
            status: "paid",
            paid_at: new Date(),
          },
        });
      }

      return order;
    });

    return NextResponse.json({ message: "Order marked as delivered", data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

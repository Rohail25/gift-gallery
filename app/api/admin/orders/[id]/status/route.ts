import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { sendDeliveryOtpEmail } from "@/lib/delivery-otp";
import { Prisma, OrderStatus } from "@prisma/client";

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    const body = await req.json();
    const newStatus = body.status as OrderStatus;
    const note = body.note as string | undefined;

    if (!newStatus || !["pending", "confirmed", "preparing", "ready_for_pickup", "assigned_to_rider", "picked_up", "on_the_way", "delivered", "cancelled", "returned"].includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const timestampData: Prisma.OrderUpdateInput = {
      confirmed_at: newStatus === "confirmed" ? new Date() : undefined,
      ready_at: newStatus === "ready_for_pickup" ? new Date() : undefined,
      picked_up_at: newStatus === "picked_up" ? new Date() : undefined,
      delivered_at: newStatus === "delivered" ? new Date() : undefined,
      cancelled_at: newStatus === "cancelled" ? new Date() : undefined,
    };

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          order_status: newStatus,
          ...timestampData,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          changed_by_user_id: admin.id,
          previous_status: existingOrder.order_status,
          new_status: newStatus,
          note: note || null,
        },
      });

      // Mark the latest active rider assignment as picked up
      if (newStatus === "picked_up") {
        await tx.orderRiderAssignment.updateMany({
          where: {
            order_id: order.id,
            picked_up_at: null,
            status: { in: ["assigned", "accepted"] },
          },
          data: { status: "picked_up", picked_up_at: new Date() },
        });
      }

      if (newStatus === "delivered") {
        await tx.orderRiderAssignment.updateMany({
          where: { order_id: order.id, completed_at: null },
          data: { status: "completed", completed_at: new Date() },
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
      }

      return order;
    });

    // Email the customer the delivery OTP (no expiry) once the parcel is picked up
    if (newStatus === "picked_up" || newStatus === "on_the_way") {
      sendDeliveryOtpEmail({
        id: existingOrder.id,
        user_id: existingOrder.user_id,
        order_number: existingOrder.order_number,
        grand_total: existingOrder.grand_total,
        user: { email: existingOrder.user.email, full_name: existingOrder.user.full_name },
      }).catch((err) => {
        console.error("Failed to send delivery OTP email:", err);
      });
    }

    return NextResponse.json({ message: "Order updated", data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

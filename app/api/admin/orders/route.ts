import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, generateOrderNumber } from "@/lib/utils";
import { sendMail, emailTemplates } from "@/lib/email";
import { Prisma, OrderStatus } from "@prisma/client";

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Prisma.OrderWhereInput = {};
    if (status && status !== "all") where.order_status = status as OrderStatus;
    if (search) {
      where.OR = [
        { order_number: { contains: search } },
        { user: { full_name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const query = {
      where,
      include: {
        user: { select: { full_name: true, email: true, phone: true } },
        items: {
          select: {
            id: true,
            product_name: true,
            quantity: true,
            unit_price: true,
            line_total: true,
          },
        },
        delivery_address: true,
      },
      orderBy: { created_at: "desc" as const },
    };

    if (pageParam) {
      const page = parseInt(pageParam) || 1;
      const limit = parseInt(searchParams.get("limit") || "20") || 20;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          ...query,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.order.count({ where }),
      ]);

      return NextResponse.json({
        data: orders,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const orders = await prisma.order.findMany(query);

    return NextResponse.json({ data: orders });
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

    if (!user || !["ADMIN", "SHOP_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { status: newStatus, rider_user_id, note } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { user: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: parseInt(id) },
        data: {
          order_status: newStatus || existingOrder.order_status,
          confirmed_at: newStatus === "confirmed" ? new Date() : existingOrder.confirmed_at,
          ready_at: newStatus === "ready_for_pickup" ? new Date() : existingOrder.ready_at,
          picked_up_at: newStatus === "picked_up" ? new Date() : existingOrder.picked_up_at,
          delivered_at: newStatus === "delivered" ? new Date() : existingOrder.delivered_at,
          cancelled_at: newStatus === "cancelled" ? new Date() : existingOrder.cancelled_at,
        },
      });

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: updated.id,
          changed_by_user_id: user.id,
          previous_status: existingOrder.order_status,
          new_status: newStatus || existingOrder.order_status,
          note: note || null,
        },
      });

      return updated;
    });

    // Send notification email
    if (newStatus === "delivered") {
      const template = emailTemplates.orderDelivered(order.order_number, existingOrder.user.full_name);
      await sendMail({
        to: existingOrder.user.email,
        subject: template.subject,
        html: template.html,
      }).catch(() => {});
    }

    // Email the customer the delivery OTP (no expiry) once the parcel is picked up
    if (newStatus === "picked_up" || newStatus === "on_the_way") {
      const { sendDeliveryOtpEmail } = await import("@/lib/delivery-otp");
      sendDeliveryOtpEmail({
        id: existingOrder.id,
        user_id: existingOrder.user_id,
        order_number: existingOrder.order_number,
        grand_total: existingOrder.grand_total,
        user: { email: existingOrder.user.email, full_name: existingOrder.user.full_name },
      }).catch(() => {});
    }

    return NextResponse.json({ message: "Order updated", data: order });
  } catch (error) {
    return handleApiError(error);
  }
}
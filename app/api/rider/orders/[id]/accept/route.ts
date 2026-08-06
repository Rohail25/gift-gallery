// app/api/rider/orders/[id]/accept/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const rider = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!rider || rider.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignment = await prisma.orderRiderAssignment.findFirst({
      where: { order_id: orderId, rider_user_id: rider.id },
      orderBy: { assigned_at: "desc" },
    });

    if (!assignment) {
      return NextResponse.json({ error: "This order is not assigned to you" }, { status: 403 });
    }

    if (assignment.status !== "assigned") {
      return NextResponse.json({ error: "This delivery has already been handled" }, { status: 400 });
    }

    await prisma.orderRiderAssignment.update({
      where: { id: assignment.id },
      data: { status: "accepted", accepted_at: new Date() },
    });

    return NextResponse.json({ message: "Delivery accepted" });
  } catch (err) {
    return handleApiError(err);
  }
}

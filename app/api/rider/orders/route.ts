// app/api/rider/orders/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const rider = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!rider || rider.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignments = await prisma.orderRiderAssignment.findMany({
      where: { rider_user_id: rider.id },
      include: {
        order: {
          include: {
            user: { select: { full_name: true, phone: true } },
            items: {
              select: {
                product_name: true,
                quantity: true,
                unit_price: true,
                primary_image_url: true,
              },
            },
            delivery_address: true,
            deliveryOtps: {
              select: {
                id: true,
                created_at: true,
                verified_at: true,
                invalidated_at: true,
                attempt_count: true,
              },
              orderBy: { created_at: "desc" },
            },
          },
        },
      },
      orderBy: { assigned_at: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: assignments });
  } catch (err) {
    return handleApiError(err);
  }
}

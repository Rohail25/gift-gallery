// app/api/rider/assign/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { handleApiError } from "@/lib/utils";

const AssignSchema = z.object({
  orderId: z.number().int().positive(),
  riderUserId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!admin || (admin.role !== "ADMIN" && admin.role !== "SHOP_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, riderUserId } = AssignSchema.parse(await req.json());

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.orderRiderAssignment.create({
        data: {
          order_id: orderId,
          rider_user_id: riderUserId,
          assigned_by_user_id: admin.id,
          status: "assigned",
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { order_status: "assigned_to_rider" },
      });

      return assignment;
    });

    return NextResponse.json({ message: "Rider assigned successfully", result });
  } catch (err) {
    return handleApiError(err);
  }
}

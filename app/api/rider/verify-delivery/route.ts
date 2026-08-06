// app/api/rider/verify-delivery/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { compare } from "bcryptjs";
import { handleApiError } from "@/lib/utils";

const VerifyDeliverySchema = z.object({
  orderId: z.number().int().positive(),
  otp: z.string().length(6),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const rider = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!rider || rider.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { orderId, otp } = VerifyDeliverySchema.parse(await req.json());

    const deliveryOtp = await prisma.deliveryOtp.findFirst({
      where: {
        order_id: orderId,
        expires_at: { gte: new Date() },
        verified_at: null,
      },
      orderBy: { created_at: "desc" },
    });

    if (!deliveryOtp) {
      return NextResponse.json({ error: "OTP expired or invalid" }, { status: 400 });
    }

    const isMatch = await compare(otp, deliveryOtp.otp_hash);
    if (!isMatch) {
      await prisma.deliveryOtp.update({
        where: { id: deliveryOtp.id },
        data: { attempt_count: { increment: 1 } },
      });
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.deliveryOtp.update({
        where: { id: deliveryOtp.id },
        data: { verified_at: new Date() },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          order_status: "delivered",
          payment_status: "paid",
          delivered_at: new Date(),
        },
      }),
      prisma.payment.create({
        data: {
          order_id: orderId,
          payment_method: "cod",
          amount: (await prisma.order.findUnique({ where: { id: orderId } }))!.grand_total,
          currency: "PKR",
          status: "paid",
          paid_at: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ message: "Delivery confirmed and payment marked as paid" });
  } catch (err) {
    return handleApiError(err);
  }
}

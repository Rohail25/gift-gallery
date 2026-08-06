// app/api/quotations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { handleApiError } from "@/lib/utils";

const QuotationSchema = z.object({
  decor_booking_id: z.number().int().positive(),
  package_amount: z.number().positive(),
  transport_charge: z.number().nonnegative(),
  additional_charge: z.number().nonnegative(),
  discount_amount: z.number().nonnegative(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || (user.role !== "ADMIN" && user.role !== "DECOR_MANAGER")) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = QuotationSchema.parse(await req.json());
    const total_amount = data.package_amount + data.transport_charge + data.additional_charge - data.discount_amount;

    const quotation = await prisma.$transaction(async (tx) => {
       const newQuotation = await tx.decorQuotation.create({
         data: {
           decor_booking_id: data.decor_booking_id,
           quotation_number: `QTN-${Date.now()}`,
           package_amount: data.package_amount,
           transport_charge: data.transport_charge,
           additional_charge: data.additional_charge,
           discount_amount: data.discount_amount,
           total_amount,
           notes: data.notes,
           status: "sent",
           created_by_user_id: user.id,
           valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Valid for 7 days
         }
       });

       await tx.decorBooking.update({
         where: { id: data.decor_booking_id },
         data: { booking_status: "quotation_sent" }
       });

       return newQuotation;
    });

    return NextResponse.json({ quotation }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

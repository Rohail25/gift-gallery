// app/api/decor-bookings/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingSchema } from "@/validators/booking";
import { handleApiError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const bookings = await prisma.decorBooking.findMany({
      where: { user_id: user.id },
      include: {
        decor_package: { select: { id: true, name: true, slug: true } },
        event_type: { select: { id: true, name: true } },
        venue_snapshot: true,
        quotations: { orderBy: { created_at: "desc" } },
        payments: { orderBy: { created_at: "desc" } },
        status_history: {
          include: { changed_by_user: { select: { full_name: true } } },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ data: bookings });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const data = BookingSchema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const packageData = await prisma.decorPackage.findUnique({ where: { id: data.decor_package_id } });
    if (!packageData || !packageData.is_visible || packageData.status !== "active") {
      return NextResponse.json({ error: "Package unavailable" }, { status: 400 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.decorBooking.create({
        data: {
          user_id: user.id,
          decor_package_id: data.decor_package_id,
          event_type_id: data.event_type_id,
          booking_number: `BOK-${Date.now()}`,
          event_date: new Date(data.event_date),
          event_start_time: data.event_start_time,
          event_end_time: data.event_end_time,
          guest_count: data.guest_count,
          venue_type: data.venue_type,
          venue_name: data.venue_name,
          theme_preferences: data.theme_preferences,
          customer_notes: data.customer_notes,
          package_starting_price: packageData.starting_price,
          transport_charge: 0, // Should be calculated/updated via quotation
          booking_status: "pending",
          payment_status: "pending",
        },
      });

      await tx.decorBookingVenue.create({
        data: {
          decor_booking_id: newBooking.id,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          address_line_1: data.address_line_1,
          city: data.city,
          area: data.area,
        },
      });

      return newBooking;
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

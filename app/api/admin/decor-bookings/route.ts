import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { Prisma, BookingStatus } from "@prisma/client";

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER", "DECOR_MANAGER"];

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

export async function GET(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const where: Prisma.DecorBookingWhereInput = {};
    if (status && status !== "all") where.booking_status = status as BookingStatus;
    if (search) {
      where.OR = [
        { booking_number: { contains: search } },
        { user: { full_name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const query = {
      where,
      include: {
        user: { select: { full_name: true, email: true, phone: true } },
        decor_package: {
          select: {
            id: true,
            name: true,
            package_code: true,
            starting_price: true,
          },
        },
        event_type: { select: { id: true, name: true } },
        venue_snapshot: true,
        _count: { select: { quotations: true } },
      },
      orderBy: { created_at: "desc" as const },
    };

    if (pageParam) {
      const page = parseInt(pageParam) || 1;
      const limit = parseInt(searchParams.get("limit") || "20") || 20;

      const [bookings, total] = await Promise.all([
        prisma.decorBooking.findMany({
          ...query,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.decorBooking.count({ where }),
      ]);

      return NextResponse.json({
        data: bookings,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const bookings = await prisma.decorBooking.findMany(query);

    return NextResponse.json({ data: bookings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { status: newStatus, quoted_amount, final_amount, note } = body;

    const existing = await prisma.decorBooking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const updated = await tx.decorBooking.update({
        where: { id: existing.id },
        data: {
          booking_status: newStatus || existing.booking_status,
          quoted_amount:
            quoted_amount !== undefined ? quoted_amount : existing.quoted_amount,
          final_amount:
            final_amount !== undefined ? final_amount : existing.final_amount,
        },
      });

      if (newStatus && newStatus !== existing.booking_status) {
        await tx.decorBookingStatusHistory.create({
          data: {
            decor_booking_id: updated.id,
            changed_by_user_id: user.id,
            previous_status: existing.booking_status,
            new_status: newStatus,
            note: note || null,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ message: "Booking updated", data: booking });
  } catch (error) {
    return handleApiError(error);
  }
}

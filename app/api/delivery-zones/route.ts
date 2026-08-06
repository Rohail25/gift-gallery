import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const DeliveryZoneSchema = z.object({
  name: z.string().min(2, "Name is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().min(2, "Area is required"),
  delivery_charge: z.number().positive("Delivery charge must be positive"),
  minimum_order_amount: z.number().positive("Minimum order amount required"),
  free_delivery_minimum: z.number().positive().optional(),
  estimated_min_minutes: z.number().int().positive().optional(),
  estimated_max_minutes: z.number().int().positive().optional(),
  cash_on_delivery_available: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    const activeOnly = searchParams.get("active") === "true";
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search");

    const where: Prisma.DeliveryZoneWhereInput = {};
    if (id) where.id = parseInt(id);
    if (city) where.city = { contains: city };
    if (area) where.area = { contains: area };
    if (activeOnly) where.is_active = true;
    if (search) {
      where.OR = [{ name: { contains: search } }];
    }

    if (pageParam) {
      const page = Math.max(1, parseInt(pageParam) || 1);
      const limit = Math.max(1, parseInt(limitParam || "20"));
      const skip = (page - 1) * limit;

      const [zones, total] = await Promise.all([
        prisma.deliveryZone.findMany({
          where,
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.deliveryZone.count({ where }),
      ]);

      return NextResponse.json({
        data: zones,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const zones = await prisma.deliveryZone.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ data: zones });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
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

    const body = await req.json();
    const data = DeliveryZoneSchema.parse(body);

    // Check for duplicate zone
    const existing = await prisma.deliveryZone.findFirst({
      where: { city: data.city, area: data.area },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Delivery zone for this city and area already exists" },
        { status: 400 }
      );
    }

    const zone = await prisma.deliveryZone.create({
      data,
    });

    return NextResponse.json({ message: "Zone created", data: zone }, { status: 201 });
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
      return NextResponse.json({ error: "Zone ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = DeliveryZoneSchema.partial().parse(body);

    const zone = await prisma.deliveryZone.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ message: "Zone updated", data: zone });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
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
      return NextResponse.json({ error: "Zone ID required" }, { status: 400 });
    }

    // Check if zone is used in orders
    const orderCount = await prisma.order.count({
      where: { delivery_zone_id: parseInt(id) },
    });

    if (orderCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: zone has orders" },
        { status: 400 }
      );
    }

    await prisma.deliveryZone.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Zone deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma, GiftTypeStatus } from "@prisma/client";

const EventTypeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  image_alt_text: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  is_visible: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const visibility = searchParams.get("visibility");
    const status = searchParams.get("status");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const search = searchParams.get("search");

    const where: Prisma.EventTypeWhereInput = {};
    if (id) {
      where.id = parseInt(id);
    }
    if (visibility === "public") {
      where.status = "active";
      where.is_visible = true;
    } else if (status) {
      where.status = status as GiftTypeStatus;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (pageParam) {
      const page = Math.max(1, parseInt(pageParam) || 1);
      const limit = Math.max(1, parseInt(limitParam || "20"));
      const skip = (page - 1) * limit;

      const [eventTypes, total] = await Promise.all([
        prisma.eventType.findMany({
          where,
          include: {
            categories: {
              where: { is_visible: true, status: "active" },
              select: { id: true, name: true, slug: true },
            },
            _count: {
              select: { categories: { where: { is_visible: true, status: "active" } } },
            },
          },
          orderBy: { sort_order: "asc" },
          skip,
          take: limit,
        }),
        prisma.eventType.count({ where }),
      ]);

      return NextResponse.json({
        data: eventTypes,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const eventTypes = await prisma.eventType.findMany({
      where,
      include: {
        categories: {
          where: { is_visible: true, status: "active" },
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { categories: { where: { is_visible: true, status: "active" } } },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json({ data: eventTypes });
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

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Decor Manager access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = EventTypeSchema.parse(body);

    const slug = data.slug || slugify(data.name);

    const existing = await prisma.eventType.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Event type with this name already exists" },
        { status: 400 }
      );
    }

    const eventType = await prisma.eventType.create({
      data: { ...data, slug },
    });

    return NextResponse.json(
      { message: "Event type created", data: eventType },
      { status: 201 }
    );
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

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Decor Manager access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event type ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = EventTypeSchema.partial().parse(body);

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const eventType = await prisma.eventType.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ message: "Event type updated", data: eventType });
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

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Decor Manager access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event type ID required" }, { status: 400 });
    }

    const eventTypeId = parseInt(id);

    // Refuse deletion if any category has decoration packages
    const packageCount = await prisma.decorCategory.count({
      where: {
        event_type_id: eventTypeId,
        packages: { some: {} },
      },
    });

    if (packageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: event type has decoration packages" },
        { status: 400 }
      );
    }

    // Delete associated decor categories first, then the event type
    await prisma.$transaction([
      prisma.decorCategory.deleteMany({
        where: { event_type_id: eventTypeId },
      }),
      prisma.eventType.delete({ where: { id: eventTypeId } }),
    ]);

    return NextResponse.json({ message: "Event type deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

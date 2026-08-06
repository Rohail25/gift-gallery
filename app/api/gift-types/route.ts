import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma, GiftTypeStatus } from "@prisma/client";

const GiftTypeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
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

    const where: Prisma.GiftTypeWhereInput = {};
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

      const [giftTypes, total] = await Promise.all([
        prisma.giftType.findMany({
          where,
          include: {
            productCategories: {
              where: {
                product_category: { is_visible: true, status: "active" },
              },
              include: {
                product_category: { select: { id: true, name: true, slug: true } },
              },
            },
            _count: {
              select: {
                productCategories: {
                  where: {
                    product_category: { is_visible: true, status: "active" },
                  },
                },
              },
            },
          },
          orderBy: { sort_order: "asc" },
          skip,
          take: limit,
        }),
        prisma.giftType.count({ where }),
      ]);

      const data = giftTypes.map((giftType) => ({
        ...giftType,
        categories: giftType.productCategories.map((pc) => pc.product_category),
        _count: { ...giftType._count, categories: giftType._count.productCategories },
      }));

      return NextResponse.json({
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const giftTypes = await prisma.giftType.findMany({
      where,
      include: {
        productCategories: {
          where: {
            product_category: { is_visible: true, status: "active" },
          },
          include: {
            product_category: { select: { id: true, name: true, slug: true } },
          },
        },
        _count: {
          select: {
            productCategories: {
              where: {
                product_category: { is_visible: true, status: "active" },
              },
            },
          },
        },
      },
      orderBy: { sort_order: "asc" },
    });

    const data = giftTypes.map((giftType) => ({
      ...giftType,
      categories: giftType.productCategories.map((pc) => pc.product_category),
      _count: { ...giftType._count, categories: giftType._count.productCategories },
    }));

    return NextResponse.json({ data });
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
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const data = GiftTypeSchema.parse(body);

    const slug = data.slug || slugify(data.name);

    // Check for duplicate slug
    const existing = await prisma.giftType.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Gift type with this name already exists" },
        { status: 400 }
      );
    }

    const giftType = await prisma.giftType.create({
      data: {
        ...data,
        slug,
      },
    });

    return NextResponse.json(
      { message: "Gift type created", data: giftType },
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

    if (!user || !["ADMIN", "SHOP_MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift type ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = GiftTypeSchema.partial().parse(body);

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const giftType = await prisma.giftType.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ message: "Gift type updated", data: giftType });
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
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gift type ID required" }, { status: 400 });
    }

    const giftTypeId = parseInt(id);

    // Delete associated category links first, then the gift type
    await prisma.$transaction([
      prisma.giftTypeProductCategory.deleteMany({
        where: { gift_type_id: giftTypeId },
      }),
      prisma.giftType.delete({
        where: { id: giftTypeId },
      }),
    ]);

    return NextResponse.json({ message: "Gift type deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const CategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  image_alt_text: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  gift_type_ids: z
    .array(z.number().int().positive("Gift type required"))
    .min(1, "At least one gift type is required"),
  sort_order: z.number().int().min(0).default(0),
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  is_visible: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const giftTypeId = searchParams.get("giftType");
    const visibility = searchParams.get("visibility");
    const pageParam = searchParams.get("page");
    const search = searchParams.get("search");

    const where: Prisma.ProductCategoryWhereInput = {};
    if (id) {
      where.id = parseInt(id);
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (giftTypeId || visibility === "public") {
      const some: Prisma.GiftTypeProductCategoryWhereInput = {};
      if (giftTypeId) {
        some.gift_type_id = parseInt(giftTypeId);
      }
      if (visibility === "public") {
        where.status = "active";
        where.is_visible = true;
        some.gift_type = { status: "active", is_visible: true };
      }
      where.giftTypes = { some };
    }

    const query = {
      where,
      include: {
        giftTypes: {
          include: { gift_type: { select: { name: true, slug: true } } },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sort_order: "asc" as const },
    };

    if (pageParam) {
      const page = parseInt(pageParam) || 1;
      const limit = parseInt(searchParams.get("limit") || "20") || 20;

      const [categories, total] = await Promise.all([
        prisma.productCategory.findMany({
          ...query,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.productCategory.count({ where }),
      ]);

      return NextResponse.json({
        data: categories.map((category) => ({
          ...category,
          gift_type: category.giftTypes[0]?.gift_type ?? null,
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const categories = await prisma.productCategory.findMany(query);

    return NextResponse.json({
      data: categories.map((category) => ({
        ...category,
        gift_type: category.giftTypes[0]?.gift_type ?? null,
      })),
    });
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
    const data = CategorySchema.parse(body);

    const { gift_type_ids, ...rest } = data;
    const slug = rest.slug || slugify(rest.name);

    const existing = await prisma.productCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.productCategory.create({
      data: {
        ...rest,
        slug,
        giftTypes: {
          create: gift_type_ids.map((gift_type_id) => ({ gift_type_id })),
        },
      },
    });

    return NextResponse.json({ message: "Category created", data: category }, { status: 201 });
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = CategorySchema.partial().parse(body);

    const { gift_type_ids, ...rest } = data;

    if (rest.name && !rest.slug) {
      rest.slug = slugify(rest.name);
    }

    const category = await prisma.productCategory.update({
      where: { id: parseInt(id) },
      data: {
        ...rest,
        ...(gift_type_ids && {
          giftTypes: {
            deleteMany: {},
            create: gift_type_ids.map((gift_type_id) => ({ gift_type_id })),
          },
        }),
      },
    });

    return NextResponse.json({ message: "Category updated", data: category });
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
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const productCount = await prisma.product.count({
      where: { product_category_id: parseInt(id) },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: category has products" },
        { status: 400 }
      );
    }

    await prisma.productCategory.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

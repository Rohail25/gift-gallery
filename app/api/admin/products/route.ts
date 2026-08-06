import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductSchema } from "@/validators/product";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma, GiftTypeStatus } from "@prisma/client";

const ProductUpdateSchema = z.object({
  product_category_id: z.number().int().positive().optional(),
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  sku: z.string().min(2).optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  regular_price: z.number().positive().optional(),
  sale_price: z.number().positive().nullable().optional(),
  cost_price: z.number().positive().nullable().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  low_stock_threshold: z.number().int().nonnegative().optional(),
  weight_grams: z.number().int().positive().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_visible: z.boolean().optional(),
  status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER"];

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");

    const where: Prisma.ProductWhereInput = {};
    if (status && status !== "all") where.status = status as GiftTypeStatus;
    if (categoryId) where.product_category_id = parseInt(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
            take: 5,
          },
          product_category: {
            include: {
              giftTypes: { include: { gift_type: { select: { name: true, slug: true } } } },
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const productData = ProductSchema.parse(body);

    const existing = await prisma.product.findUnique({ where: { sku: productData.sku } });
    if (existing) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      );
    }

    const slug =
      body.slug && body.slug !== productData.slug
        ? body.slug
        : slugify(productData.name) + "-" + Date.now().toString(36);

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        images: {
          create: (body.images || []).map(
            (img: { image_url: string; sort_order?: number; is_primary?: boolean }) => ({
              image_url: img.image_url,
              sort_order: img.sort_order ?? 0,
              is_primary: img.is_primary ?? false,
            })
          ),
        },
      },
      include: {
        images: true,
        product_category: {
          include: {
            giftTypes: { include: { gift_type: { select: { name: true } } } },
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", data: product },
      { status: 201 }
    );
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
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const body = await req.json();
    const productData = ProductUpdateSchema.parse(body);

    const existing = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (productData.sku && productData.sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({
        where: { sku: productData.sku },
      });
      if (skuTaken) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 }
        );
      }
    }

    if (productData.name && !body.slug) {
      productData.slug = slugify(productData.name) + "-" + existing.id;
    }

    const { images, ...rest } = body;

    const product = await prisma.$transaction(async (tx) => {
      if (Array.isArray(images) && images.length > 0) {
        await tx.productImage.deleteMany({ where: { product_id: existing.id } });
        await tx.productImage.createMany({
          data: images.map(
            (img: { image_url: string; sort_order?: number; is_primary?: boolean }, index: number) => ({
              product_id: existing.id,
              image_url: img.image_url,
              sort_order: img.sort_order ?? index,
              is_primary: img.is_primary ?? index === 0,
            })
          ),
        });
      }

      return tx.product.update({
        where: { id: existing.id },
        data: rest,
        include: {
          images: true,
          product_category: {
            include: {
              giftTypes: { include: { gift_type: { select: { name: true } } } },
            },
          },
        },
      });
    });

    return NextResponse.json({ message: "Product updated", data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      await prisma.$transaction([
        prisma.productImage.deleteMany({ where: { product_id: product.id } }),
        prisma.productReview.deleteMany({ where: { product_id: product.id } }),
        prisma.product.delete({ where: { id: product.id } }),
      ]);
    } catch {
      return NextResponse.json(
        { error: "Cannot delete: product exists in active carts or order history" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

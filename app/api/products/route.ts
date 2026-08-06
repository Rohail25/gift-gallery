import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProductSchema } from "@/validators/product";
import { handleApiError } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category");
    const giftTypeId = searchParams.get("giftType");
    const sort = searchParams.get("sort") || "newest";
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const where: Prisma.ProductWhereInput = {
      status: "active",
      is_visible: true,
    };

    // Search
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    // Category filter
    if (categoryId) {
      where.product_category_id = parseInt(categoryId);
    }

    // Gift Type filter (through category)
    if (giftTypeId) {
      where.product_category = {
        giftTypes: { some: { gift_type_id: parseInt(giftTypeId) } },
      };
    }

    // Price range
    if (minPrice || maxPrice) {
      where.regular_price = {};
      if (minPrice) where.regular_price.gte = parseFloat(minPrice);
      if (maxPrice) where.regular_price.lte = parseFloat(maxPrice);
    }

    // Featured
    if (featured === "true") {
      where.is_featured = true;
    }

    // Best selling: order by total quantity sold (no schema change needed)
    let bestSellerIds: number[] | null = null;
    if (sort === "best-selling") {
      const sold = await prisma.orderItem.groupBy({
        by: ["product_id"],
        where: { product_id: { not: null } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 100,
      });
      bestSellerIds = sold
        .map((s) => s.product_id)
        .filter((id): id is number => id !== null);
    }

    // Sorting
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sort) {
      case "price-low":
        orderBy.regular_price = "asc";
        break;
      case "price-high":
        orderBy.regular_price = "desc";
        break;
      case "name-asc":
        orderBy.name = "asc";
        break;
      case "name-desc":
        orderBy.name = "desc";
        break;
      case "popular":
        orderBy.reviews_count = "desc";
        break;
      case "recommended":
        orderBy.average_rating = "desc";
        orderBy.reviews_count = "desc";
        break;
      case "best-selling":
        orderBy.created_at = "desc";
        break;
      default:
        orderBy.created_at = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            where: { is_visible: true },
            orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
            take: 5,
          },
          product_category: {
            include: {
              giftTypes: { include: { gift_type: true } },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Order best sellers by sold quantity (products without sales stay at the end)
    let data = products;
    if (bestSellerIds) {
      const index = new Map(bestSellerIds.map((id, i) => [id, i]));
      data = [...products].sort((a, b) => {
        const ai = index.get(a.id);
        const bi = index.get(b.id);
        if (ai !== undefined && bi !== undefined) return ai - bi;
        if (ai !== undefined) return -1;
        if (bi !== undefined) return 1;
        return 0;
      });
    }

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// Admin only - create product
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
    const productData = ProductSchema.parse(body);

    // Generate slug and SKU if not provided
    const slug =
      body.slug || slugify(productData.name) + "-" + Date.now().toString(36);
    const sku = body.sku || "PRD-" + Date.now().toString(36).toUpperCase();

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug,
        sku,
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
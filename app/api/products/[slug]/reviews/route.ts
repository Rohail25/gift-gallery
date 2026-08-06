import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError, getPaginationMeta } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "5") || 5)
    );

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true, average_rating: true, reviews_count: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { product_id: product.id, status: "approved" },
        include: {
          user: {
            select: { full_name: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productReview.count({
        where: { product_id: product.id, status: "approved" },
      }),
    ]);

    return NextResponse.json({
      data: reviews,
      meta: {
        ...getPaginationMeta(page, limit, total),
        average_rating: product.average_rating,
        reviews_count: product.reviews_count,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

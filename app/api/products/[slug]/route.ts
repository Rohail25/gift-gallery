// app/api/products/[slug]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
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
    });

    if (!product || !product.is_visible || product.status !== "active") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    return handleApiError(err);
  }
}

import prisma from "@/lib/prisma";

/**
 * Recompute a product's average_rating and reviews_count from its approved
 * reviews. Call after reviews are created, approved, rejected, or deleted.
 */
export async function recomputeProductReviewAggregates(productId: number) {
  const approved = await prisma.productReview.aggregate({
    where: { product_id: productId, status: "approved" },
    _count: { _all: true },
    _avg: { rating: true },
  });

  const reviews_count = approved._count._all;
  const average_rating = approved._avg.rating ?? 0;

  await prisma.product.update({
    where: { id: productId },
    data: { average_rating, reviews_count },
  });

  return { average_rating, reviews_count };
}

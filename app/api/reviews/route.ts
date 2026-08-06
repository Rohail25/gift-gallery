import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { recomputeProductReviewAggregates } from "@/lib/reviews";
import { z } from "zod";

const ReviewSchema = z.object({
  order_item_id: z.number().int().positive("Select a product to review"),
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating")
    .max(5, "Rating must be between 1 and 5"),
  description: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be less than 1000 characters"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please login to submit a review" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = ReviewSchema.parse(await req.json());

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: body.order_item_id },
      include: {
        order: {
          select: { id: true, user_id: true, order_status: true },
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    if (orderItem.order.user_id !== user.id) {
      return NextResponse.json({ error: "You can only review items from your own orders" }, { status: 403 });
    }

    if (orderItem.order.order_status !== "delivered") {
      return NextResponse.json(
        { error: "You can only review items after your order has been delivered" },
        { status: 400 }
      );
    }

    if (!orderItem.product_id) {
      return NextResponse.json(
        { error: "This item cannot be reviewed" },
        { status: 400 }
      );
    }

    const existingReview = await prisma.productReview.findFirst({
      where: { user_id: user.id, order_item_id: orderItem.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = await prisma.productReview.create({
      data: {
        product_id: orderItem.product_id,
        user_id: user.id,
        order_item_id: orderItem.id,
        rating: body.rating,
        description: body.description,
        status: "pending",
        is_verified_purchase: true,
      },
    });

    await recomputeProductReviewAggregates(orderItem.product_id);

    return NextResponse.json(
      {
        message: "Your review has been submitted and will appear after approval",
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { Prisma } from "@prisma/client";

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER", "DECOR_MANAGER"];

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
    const pageParam = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search") || "";

    const statusWhere = status && status !== "all" ? { status } : {};

    const productWhere: Prisma.ProductReviewWhereInput = {
      ...statusWhere,
      ...(search
        ? {
            OR: [
              { description: { contains: search } },
              { user: { is: { full_name: { contains: search } } } },
              { user: { is: { email: { contains: search } } } },
              { product: { is: { name: { contains: search } } } },
            ],
          }
        : {}),
    };

    const decorWhere: Prisma.DecorReviewWhereInput = {
      ...statusWhere,
      ...(search
        ? {
            OR: [
              { description: { contains: search } },
              { user: { is: { full_name: { contains: search } } } },
              { user: { is: { email: { contains: search } } } },
              { decor_package: { is: { name: { contains: search } } } },
            ],
          }
        : {}),
    };

    const page = pageParam ? parseInt(pageParam) : null;

    const [productReviews, decorReviews, productTotal, decorTotal] =
      await Promise.all([
        prisma.productReview.findMany({
          where: productWhere,
          include: {
            product: { select: { id: true, name: true, slug: true } },
            user: { select: { full_name: true, email: true } },
            order_item: { select: { id: true, product_name: true } },
          },
          orderBy: { created_at: "desc" },
          ...(page !== null ? { skip: (page - 1) * limit, take: limit } : {}),
        }),
        prisma.decorReview.findMany({
          where: decorWhere,
          include: {
            decor_package: { select: { id: true, name: true } },
            user: { select: { full_name: true, email: true } },
            decor_booking: { select: { booking_number: true } },
          },
          orderBy: { created_at: "desc" },
          ...(page !== null ? { skip: (page - 1) * limit, take: limit } : {}),
        }),
        prisma.productReview.count({ where: productWhere }),
        prisma.decorReview.count({ where: decorWhere }),
      ]);

    const productReviewsMapped = productReviews.map((review) => ({
      ...review,
      kind: "product",
      item_name: review.product.name,
    }));
    const decorReviewsMapped = decorReviews.map((review) => ({
      ...review,
      kind: "decor",
      item_name: review.decor_package.name,
    }));

    const merged =
      type === "product"
        ? productReviewsMapped
        : type === "decor"
        ? decorReviewsMapped
        : [...productReviewsMapped, ...decorReviewsMapped];

    merged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (page === null) {
      return NextResponse.json({ data: merged });
    }

    return NextResponse.json({
      data: merged,
      meta: {
        page,
        limit,
        total: productTotal + decorTotal,
        productTotal,
        decorTotal,
        totalPages: Math.ceil((productTotal + decorTotal) / limit),
      },
    });
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
    const kind = searchParams.get("kind");

    if (!id || !kind || !["product", "decor"].includes(kind)) {
      return NextResponse.json(
        { error: "Review id and kind (product|decor) required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, admin_reply } = body;

    const data: {
      status?: string;
      admin_reply?: string | null;
      admin_replied_at?: Date | null;
    } = {};
    if (status) data.status = status;
    if (admin_reply !== undefined) {
      data.admin_reply = admin_reply;
      data.admin_replied_at = admin_reply ? new Date() : null;
    }

    const review =
      kind === "product"
        ? await prisma.productReview.update({
            where: { id: parseInt(id) },
            data,
          })
        : await prisma.decorReview.update({
            where: { id: parseInt(id) },
            data,
          });

    return NextResponse.json({ message: "Review updated", data: review });
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
    const kind = searchParams.get("kind");

    if (!id || !kind || !["product", "decor"].includes(kind)) {
      return NextResponse.json(
        { error: "Review id and kind (product|decor) required" },
        { status: 400 }
      );
    }

    if (kind === "product") {
      const review = await prisma.productReview.findUnique({
        where: { id: parseInt(id) },
      });
      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }
      await prisma.$transaction([
        prisma.product.update({
          where: { id: review.product_id },
          data: {
            reviews_count: { decrement: 1 },
          },
        }),
        prisma.productReview.delete({ where: { id: review.id } }),
      ]);
    } else {
      const review = await prisma.decorReview.findUnique({
        where: { id: parseInt(id) },
      });
      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }
      await prisma.$transaction([
        prisma.decorPackage.update({
          where: { id: review.decor_package_id },
          data: { reviews_count: { decrement: 1 } },
        }),
        prisma.decorReview.delete({ where: { id: review.id } }),
      ]);
    }

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

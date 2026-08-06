import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: {
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
        },
        product_category: {
          include: {
            giftTypes: { include: { gift_type: { select: { name: true } } } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    return handleApiError(error);
  }
}

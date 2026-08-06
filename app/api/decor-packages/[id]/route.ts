import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    const decorPackage = await prisma.decorPackage.findUnique({
      where: Number.isInteger(idNum) ? { id: idNum } : { slug: id },
      include: {
        decor_category: {
          include: { event_type: true },
        },
        images: {
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
        },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    if (
      !decorPackage ||
      !decorPackage.is_visible ||
      decorPackage.status !== "active"
    ) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ data: decorPackage });
  } catch (error) {
    return handleApiError(error);
  }
}

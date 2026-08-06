import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const decorPackage = await prisma.decorPackage.findUnique({
      where: { id: parseInt(id) },
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

    if (!decorPackage) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ data: decorPackage });
  } catch (error) {
    return handleApiError(error);
  }
}

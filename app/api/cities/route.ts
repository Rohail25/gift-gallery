import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, province: true },
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    return handleApiError(error);
  }
}

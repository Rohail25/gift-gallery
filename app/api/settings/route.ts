import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/utils";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { is_public: true },
      orderBy: { key: "asc" },
    });

    const map: Record<string, string | null> = {};
    for (const setting of settings) {
      map[setting.key] = setting.value ?? null;
    }

    return NextResponse.json({ data: map });
  } catch (error) {
    return handleApiError(error);
  }
}

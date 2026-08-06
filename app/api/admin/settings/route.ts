import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

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

export async function GET() {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const settings = await prisma.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { settings } = body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return NextResponse.json(
        { error: "settings array required" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      settings.map((setting: { key: string; value?: string; group?: string; label?: string; is_public?: boolean }) =>
        prisma.siteSetting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value ?? null,
            group: setting.group,
            label: setting.label,
            is_public: setting.is_public ?? false,
          },
          create: {
            key: setting.key,
            value: setting.value ?? null,
            group: setting.group ?? "general",
            label: setting.label,
            is_public: setting.is_public ?? false,
          },
        })
      )
    );

    const updated = await prisma.siteSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ message: "Settings updated", data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

async function requireAdmin() {
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

  return user;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only image files are allowed (JPEG, PNG, WebP, GIF, AVIF, SVG)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

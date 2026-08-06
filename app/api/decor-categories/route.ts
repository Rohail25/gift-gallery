import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const DecorCategorySchema = z.object({
  event_type_id: z.number().int().positive("Event type required"),
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  image_alt_text: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  sort_order: z.number().int().default(0),
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  is_visible: z.boolean().default(false),
});

const categoryInclude = {
  event_type: { select: { name: true, slug: true } },
  _count: { select: { packages: true } },
} as const;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const pageParam = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    if (id) {
      const category = await prisma.decorCategory.findUnique({
        where: { id: parseInt(id) },
        include: categoryInclude,
      });
      return NextResponse.json({ data: category });
    }

    const where: Prisma.DecorCategoryWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (pageParam) {
      const page = parseInt(pageParam) || 1;
      const [categories, total] = await Promise.all([
        prisma.decorCategory.findMany({
          where,
          include: categoryInclude,
          orderBy: { sort_order: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.decorCategory.count({ where }),
      ]);

      return NextResponse.json({
        data: categories,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const categories = await prisma.decorCategory.findMany({
      where,
      include: categoryInclude,
      orderBy: { sort_order: "asc" },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = DecorCategorySchema.parse(body);

    const slug = data.slug || slugify(data.name);

    const category = await prisma.decorCategory.create({
      data: {
        ...data,
        slug,
      },
    });

    return NextResponse.json(
      { message: "Category created", data: category },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = DecorCategorySchema.partial().parse(body);

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const category = await prisma.decorCategory.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ message: "Category updated", data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !["ADMIN", "DECOR_MANAGER"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID required" }, { status: 400 });
    }

    const packageCount = await prisma.decorPackage.count({
      where: { decor_category_id: parseInt(id) },
    });

    if (packageCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: category has packages" },
        { status: 400 }
      );
    }

    await prisma.decorCategory.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

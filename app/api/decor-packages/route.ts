import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError, slugify } from "@/lib/utils";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const DecorPackageImageSchema = z.object({
  image_url: z.string().min(1, "Image URL required"),
  alt_text: z.string().optional(),
  is_primary: z.boolean().default(false),
});

const DecorPackageSchema = z.object({
  decor_category_id: z.number().int().positive("Category required"),
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  package_code: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  included_items: z.array(z.string()),
  excluded_items: z.array(z.string()).optional(),
  terms_and_conditions: z.string().optional(),
  starting_price: z.number().positive("Starting price must be positive"),
  sale_price: z.number().positive().optional(),
  estimated_setup_hours: z.number().int().positive().optional(),
  maximum_guests: z.number().int().positive().optional(),
  service_city: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  images: z.array(DecorPackageImageSchema).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");
    const visibility = searchParams.get("visibility");
    const featured = searchParams.get("featured");
    const pageParam = searchParams.get("page");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where: Prisma.DecorPackageWhereInput = {};
    if (categoryId) where.decor_category_id = parseInt(categoryId);
    if (visibility === "public") {
      where.status = "active";
      where.is_visible = true;
    }
    if (featured === "true") where.is_featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { package_code: { contains: search } },
      ];
    }

    const page = pageParam ? parseInt(pageParam) : null;
    const packages = await prisma.decorPackage.findMany({
      where,
      include: {
        decor_category: {
          include: { event_type: true },
        },
        images: {
          where: { is_visible: true },
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
        },
        _count: { select: { bookings: true, reviews: true } },
      },
      orderBy: { created_at: "desc" },
      ...(page !== null ? { skip: (page - 1) * limit, take: limit } : {}),
    });

    if (page === null) {
      return NextResponse.json({ data: packages });
    }

    const total = await prisma.decorPackage.count({ where });

    return NextResponse.json({
      data: packages,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
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
    const data = DecorPackageSchema.parse(body);

    const { images, ...packageData } = data;
    const slug = data.slug || slugify(data.name);
    const packageCode = data.package_code || "PKG-" + Date.now().toString(36).toUpperCase();

    const decorPackage = await prisma.decorPackage.create({
      data: {
        ...packageData,
        slug,
        package_code: packageCode,
        images: images?.length
          ? {
              create: images.map((img, index) => ({
                ...img,
                sort_order: index,
              })),
            }
          : undefined,
      },
    });

    return NextResponse.json(
      { message: "Package created", data: decorPackage },
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
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    const body = await req.json();
    const data = DecorPackageSchema.partial().parse(body);

    const existing = await prisma.decorPackage.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const { images, ...packageData } = data;

    if (packageData.name && !packageData.slug) {
      packageData.slug = slugify(packageData.name);
    }

    const decorPackage = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.decorPackageImage.deleteMany({
          where: { decor_package_id: existing.id },
        });
        if (images.length > 0) {
          await tx.decorPackageImage.createMany({
            data: images.map((img, index) => ({
              ...img,
              decor_package_id: existing.id,
              sort_order: index,
            })),
          });
        }
      }

      return tx.decorPackage.update({
        where: { id: existing.id },
        data: packageData,
      });
    });

    return NextResponse.json({ message: "Package updated", data: decorPackage });
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
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    const bookingCount = await prisma.decorBooking.count({
      where: { decor_package_id: parseInt(id) },
    });

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: package has bookings" },
        { status: 400 }
      );
    }

    await prisma.decorPackageImage.deleteMany({
      where: { decor_package_id: parseInt(id) },
    });
    await prisma.decorPackage.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ message: "Package deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
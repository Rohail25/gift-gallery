import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import * as XLSX from "xlsx";

export async function GET() {
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

    const categories = await prisma.productCategory.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    });
    const exampleCategory = categories[0]?.slug || "luxury-florals";

    const sample = [
      {
        name: "Example Luxury Rose Bouquet",
        sku: "PRD-IMPORT-001",
        category: exampleCategory,
        regular_price: 4999,
        sale_price: 4499,
        cost_price: 3000,
        stock_quantity: 25,
        low_stock_threshold: 10,
        short_description: "A hand-tied bouquet of fresh red roses.",
        description: "Premium hand-wrapped luxury rose bouquet, perfect for every occasion.",
        status: "active",
        is_visible: "yes",
        is_featured: "yes",
        image_url: "https://example.com/rose-bouquet.jpg",
        meta_title: "Luxury Rose Bouquet",
        meta_description: "Premium luxury rose bouquet delivery",
      },
    ];

    const sheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Products");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="product-import-template.xlsx"',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

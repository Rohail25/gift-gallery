import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import * as XLSX from "xlsx";

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

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(String(value).replace(/[,]/g, ""));
  return Number.isNaN(num) ? null : num;
}

function toBool(value: unknown): boolean | null {
  if (value === null || value === undefined || value === "") return null;
  const str = String(value).trim().toLowerCase();
  return ["yes", "y", "true", "1", "active", "visible"].includes(str);
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin();
    if (user instanceof NextResponse) return user;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "The file is empty. Download the sample template and try again." },
        { status: 400 }
      );
    }

    // Load all categories once for fast lookup
    const categories = await prisma.productCategory.findMany({
      select: { id: true, name: true, slug: true },
    });
    const categoriesBySlug = new Map(
      categories.map((c) => [c.slug.toLowerCase(), c.id])
    );
    const categoriesByName = new Map(
      categories.map((c) => [c.name.toLowerCase(), c.id])
    );

    const statuses = ["draft", "active", "inactive", "archived"];
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];
    const results: Array<{ row: number; name: string; sku: string; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      const name = String(row["name"] || row["Name"] || "").trim();
      const sku = String(row["sku"] || row["SKU"] || "").trim();
      const categoryRef = String(row["category"] || row["Category"] || "").trim();

      if (!name || !sku || !categoryRef) {
        skipped++;
        errors.push(`Row ${rowNumber}: name, sku and category are required`);
        continue;
      }

      const categoryId =
        categoriesBySlug.get(categoryRef.toLowerCase()) ??
        categoriesByName.get(categoryRef.toLowerCase());

      if (!categoryId) {
        skipped++;
        errors.push(`Row ${rowNumber}: category "${categoryRef}" not found`);
        continue;
      }

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        skipped++;
        errors.push(`Row ${rowNumber}: SKU "${sku}" already exists`);
        continue;
      }

      const regularPrice = toNumber(row["regular_price"] || row["price"]);
      if (regularPrice === null || regularPrice <= 0) {
        skipped++;
        errors.push(`Row ${rowNumber}: regular_price must be a positive number`);
        continue;
      }

      const salePrice = toNumber(row["sale_price"]);
      const statusValue = String(row["status"] || "draft").toLowerCase().trim();
      const status = statuses.includes(statusValue) ? statusValue : "draft";

      try {
        await prisma.product.create({
          data: {
            product_category_id: categoryId,
            name,
            slug: slugify(name) + "-" + sku.toLowerCase().replace(/[^a-z0-9]/g, ""),
            sku,
            short_description: String(row["short_description"] || "").trim() || null,
            description: String(row["description"] || "").trim() || null,
            regular_price: regularPrice,
            sale_price: salePrice && salePrice > 0 ? salePrice : null,
            cost_price: toNumber(row["cost_price"]),
            stock_quantity: toNumber(row["stock_quantity"]) ?? 0,
            low_stock_threshold: toNumber(row["low_stock_threshold"]) ?? 10,
            is_featured: toBool(row["is_featured"]) ?? false,
            is_visible: toBool(row["is_visible"]) ?? true,
            status: status as "draft",
            meta_title: String(row["meta_title"] || "").trim() || null,
            meta_description: String(row["meta_description"] || "").trim() || null,
            images:
              String(row["image_url"] || "").trim() && String(row["image_url"]).trim().length > 0
                ? {
                    create: {
                      image_url: String(row["image_url"]).trim(),
                      sort_order: 0,
                      is_primary: true,
                    },
                  }
                : undefined,
          },
        });
        created++;
        results.push({ row: rowNumber, name, sku, message: "Imported" });
      } catch (error) {
        skipped++;
        errors.push(`Row ${rowNumber}: ${(error as Error).message}`);
      }
    }

    return NextResponse.json({
      message: `Import complete: ${created} created, ${skipped} skipped`,
      created,
      skipped,
      errors,
      results,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

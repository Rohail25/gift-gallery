import type { Metadata } from "next";
import { cache } from "react";
import prisma from "@/lib/prisma";
import ProductDetailClient, { Product } from "./ProductDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const getProduct = cache(async (slug: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        regular_price: true,
        sale_price: true,
        stock_quantity: true,
        low_stock_threshold: true,
        description: true,
        short_description: true,
        average_rating: true,
        reviews_count: true,
        is_visible: true,
        status: true,
        meta_title: true,
        meta_description: true,
        images: {
          where: { is_visible: true },
          orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
          take: 5,
          select: { id: true, image_url: true, is_primary: true },
        },
        product_category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product || !product.is_visible || product.status !== "active") {
      return null;
    }

    const { meta_title, meta_description, ...rest } = product;
    return { ...rest, meta_title, meta_description };
  } catch {
    return null;
  }
});

type ProductWithMeta = Awaited<ReturnType<typeof getProduct>>;
type ProductData = NonNullable<ProductWithMeta>;

const toClientProduct = (p: ProductData): Product => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  sku: p.sku,
  regular_price: Number(p.regular_price),
  sale_price: p.sale_price !== null ? Number(p.sale_price) : undefined,
  stock_quantity: p.stock_quantity,
  low_stock_threshold: p.low_stock_threshold,
  description: p.description ?? undefined,
  short_description: p.short_description ?? undefined,
  average_rating: p.average_rating,
  reviews_count: p.reviews_count,
  images: p.images,
  product_category: p.product_category
    ? { id: p.product_category.id, name: p.product_category.name, slug: p.product_category.slug }
    : undefined,
});

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found | GiftGallery",
      description: "The requested product could not be found on Gift Gallery.",
    };
  }

  const title = `${product.meta_title || product.name} | GiftGallery`;
  const description =
    product.meta_description ||
    product.short_description ||
    `Shop ${product.name} at Gift Gallery. Luxury gifts with premium quality and fast delivery.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/products/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/products/${product.slug}`,
      siteName: "Gift Gallery",
      type: "website",
    },
  };
}

export default async function ProductDetailPageWrapper(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  const initialProduct = product ? toClientProduct(product) : null;

  return <ProductDetailClient initialProduct={initialProduct} />;
}

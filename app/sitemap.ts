// app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const staticEntries: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date() },
  { url: `${BASE_URL}/shop`, lastModified: new Date() },
  { url: `${BASE_URL}/decor`, lastModified: new Date() },
  { url: `${BASE_URL}/about`, lastModified: new Date() },
  { url: `${BASE_URL}/contact`, lastModified: new Date() },
  { url: `${BASE_URL}/privacy-policy`, lastModified: new Date() },
  { url: `${BASE_URL}/terms`, lastModified: new Date() },
  { url: `${BASE_URL}/orders`, lastModified: new Date() },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const products = await prisma.product.findMany({ where: { is_visible: true, status: "active" } });
    productEntries = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updated_at,
    }));
  } catch (error) {
    console.warn("sitemap: skipping product entries (database unavailable)", error);
  }

  return [...staticEntries, ...productEntries];
}

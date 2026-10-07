import type { Metadata } from "next";
import { cache } from "react";
import prisma from "@/lib/prisma";
import DecorPackageDetailClient from "./DecorPackageDetailClient";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const getPackage = cache(async (slug: string) => {
  try {
    const decorPackage = await prisma.decorPackage.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        package_code: true,
        starting_price: true,
        sale_price: true,
        short_description: true,
        description: true,
        included_items: true,
        excluded_items: true,
        terms_and_conditions: true,
        estimated_setup_hours: true,
        maximum_guests: true,
        service_city: true,
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
        decor_category: {
          select: {
            name: true,
            slug: true,
            event_type: { select: { name: true, slug: true } },
          },
        },
      },
    });

    if (
      !decorPackage ||
      !decorPackage.is_visible ||
      decorPackage.status !== "active"
    ) {
      return null;
    }

    return decorPackage;
  } catch {
    return null;
  }
});

type DecorPackageData = NonNullable<Awaited<ReturnType<typeof getPackage>>>;

const toClientPackage = (p: DecorPackageData) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  package_code: p.package_code,
  starting_price: Number(p.starting_price),
  sale_price: p.sale_price !== null ? Number(p.sale_price) : undefined,
  description: p.description,
  included_items: (p.included_items as string[]) || [],
  excluded_items: ((p.excluded_items as string[]) || []),
  terms_and_conditions: p.terms_and_conditions ?? undefined,
  estimated_setup_hours: p.estimated_setup_hours ?? 0,
  maximum_guests: p.maximum_guests ?? 0,
  service_city: p.service_city ?? undefined,
  average_rating: p.average_rating,
  reviews_count: p.reviews_count,
  images: p.images,
  decor_category: p.decor_category,
});

export async function generateMetadata(props: PageProps<"/decor/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const decorPackage = await getPackage(slug);

  if (!decorPackage) {
    return {
      title: "Decor Package Not Found | GiftGallery",
      description: "The requested decor package could not be found on Gift Gallery.",
    };
  }

  const title = `${decorPackage.meta_title || decorPackage.name} — Gift Gallery | GiftGallery`;
  const description =
    decorPackage.meta_description ||
    decorPackage.short_description ||
    `Explore ${decorPackage.name} — bespoke event decoration by Gift Gallery.`;

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/decor/${decorPackage.slug}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/decor/${decorPackage.slug}`,
      siteName: "Gift Gallery",
      type: "website",
    },
  };
}

export default async function DecorPackageDetailPageWrapper(props: PageProps<"/decor/[slug]">) {
  const { slug } = await props.params;
  const decorPackage = await getPackage(slug);
  const initialPackage = decorPackage ? toClientPackage(decorPackage) : null;

  return <DecorPackageDetailClient initialPackage={initialPackage} />;
}

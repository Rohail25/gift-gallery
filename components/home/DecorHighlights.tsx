"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Star } from "lucide-react";

type DecorPackage = {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  starting_price: number | string;
  sale_price?: number | string | null;
  maximum_guests?: number | null;
  service_city?: string;
  images: Array<{ image_url: string; is_primary: boolean }>;
  decor_category: { name: string; event_type: { name: string } };
  _count?: { bookings: number; reviews: number };
};

function formatPrice(price: number | string): string {
  return Math.round(Number(price)).toLocaleString();
}

export function DecorHighlights() {
  const [packages, setPackages] = useState<DecorPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/decor-packages?visibility=public&featured=true");
        const data = await res.json();
        const list = data.data || [];
        if (!cancelled) setPackages(list.slice(0, 3));
      } catch {
        if (!cancelled) setPackages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-14 md:py-20 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
              Event Decor
            </p>
            <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
              Decor <span className="text-gold-primary italic">Highlights</span>
            </h2>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Signature decoration packages crafted by our expert team for every occasion
            </p>
          </div>
          <Link
            href="/decor"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-primary hover:text-gold-dark transition group shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-custom overflow-hidden bg-bg-card">
                <div className="aspect-[16/10] bg-bg-secondary animate-pulse"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-bg-secondary rounded animate-pulse w-2/3"></div>
                  <div className="h-3 bg-bg-secondary rounded animate-pulse w-full"></div>
                  <div className="h-8 bg-bg-secondary rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-bg-card rounded-2xl border border-border-custom p-12 text-center text-text-secondary">
            Decor packages are being prepared. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const image = pkg.images.find((img) => img.is_primary) || pkg.images[0];
              return (
                <Link
                  key={pkg.id}
                  href={`/decor/${pkg.slug}`}
                  className="group bg-bg-card rounded-2xl border border-border-custom overflow-hidden hover:border-gold-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-primary/10 transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-bg-secondary">
                    {image ? (
                      <Image
                        src={image.image_url}
                        alt={pkg.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        loading="lazy"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-rose-gold/10"></div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 text-text-primary text-xs font-medium px-3 py-1 rounded-full">
                      {pkg.decor_category?.name}
                    </span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col">
                    <p className="text-xs uppercase tracking-wide text-gold-primary mb-1">
                      {pkg.decor_category?.event_type?.name}
                    </p>
                    <h3 className="font-luxury text-xl text-text-primary group-hover:text-gold-primary transition">
                      {pkg.name}
                    </h3>
                    {pkg.short_description && (
                      <p className="text-sm text-text-secondary mt-2 line-clamp-2 flex-1">
                        {pkg.short_description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                      {pkg.maximum_guests && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-gold-primary" />
                          Up to {pkg.maximum_guests} guests
                        </span>
                      )}
                      {typeof pkg._count?.reviews === "number" && (
                        <span className="inline-flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-gold-primary" />
                          {pkg._count.reviews} reviews
                        </span>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-custom flex items-center justify-between">
                      <div>
                        <span className="text-xs text-text-secondary">Starting from</span>
                        <p className="text-xl font-luxury text-gold-primary">
                          Rs. {formatPrice(pkg.starting_price)}
                        </p>
                      </div>
                      <span className="text-gold-primary text-sm font-medium">View</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

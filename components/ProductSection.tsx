"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";

type ProductSectionProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  params?: Record<string, string>;
  badge?: "new" | "sale" | "featured" | "best-seller";
  limit?: number;
  count?: number;
  bg?: "bg-bg-primary" | "bg-bg-secondary";
};

export function ProductSection({
  eyebrow,
  title,
  subtitle,
  viewAllHref = "/shop",
  params = {},
  badge,
  limit = 8,
  count = 8,
  bg = "bg-bg-primary",
}: ProductSectionProps) {
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const p = paramsKey
          ? (JSON.parse(paramsKey) as Record<string, string>)
          : {};
        const sp = new URLSearchParams({ limit: String(limit), ...p });
        const res = await fetch(`/api/products?${sp.toString()}`);
        const data = await res.json();
        if (!cancelled) setProducts(data.data || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [paramsKey, limit]);

  return (
    <section className={`py-14 md:py-20 ${bg}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
              {eyebrow}
            </p>
            <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">{title}</h2>
            {subtitle && (
              <p className="text-text-secondary mt-2 max-w-2xl">{subtitle}</p>
            )}
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-primary hover:text-gold-dark transition group shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-bg-card rounded-2xl border border-border-custom p-12 text-center text-text-secondary">
            No products found in this collection yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} badge={badge} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CategoriesSection, CategoryItem } from "@/components/home/CategoriesSection";

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/product-categories?visibility=public");
        const data = await res.json();
        if (!cancelled) setCategories(data.data || []);
      } catch {
        if (!cancelled) setCategories([]);
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
    <div className="bg-bg-primary">
      <div className="bg-bg-secondary border-b border-border-custom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Explore Collections
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary">
            Shop by <span className="text-gold-primary italic">Categories</span>
          </h1>
          <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
            Find exactly what you are looking for across all our curated categories
          </p>
        </div>
      </div>

      <div className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse aspect-[4/5] rounded-2xl bg-bg-card border border-border-custom"></div>
              ))}
            </div>
          ) : (
            <CategoriesSection categories={categories} limit={categories.length} />
          )}
        </div>
      </div>
    </div>
  );
}

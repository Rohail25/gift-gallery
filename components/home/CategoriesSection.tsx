import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package } from "lucide-react";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  _count?: { products: number };
};

export function CategoriesSection({ categories }: { categories: CategoryItem[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
              Explore Collections
            </p>
            <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
              Shop by <span className="text-gold-primary italic">Categories</span>
            </h2>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Find exactly what you are looking for across our curated categories
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-primary hover:text-gold-dark transition group shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-bg-secondary border border-border-custom hover:border-gold-primary transition-all duration-300"
            >
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-primary/10 to-rose-gold/10">
                  <Package className="w-12 h-12 text-gold-primary/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white">
                <h3 className="font-luxury text-lg sm:text-xl group-hover:text-gold-light transition">
                  {category.name}
                </h3>
                {typeof category._count?.products === "number" && (
                  <p className="text-xs text-white/75 mt-1">
                    {category._count.products} products
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

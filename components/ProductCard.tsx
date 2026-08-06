// components/ProductCard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/components/WishlistProvider";

type ProductImage = { image_url: string; is_primary?: boolean };

export type ProductCardProduct = {
  id: number;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number | null;
  average_rating?: number;
  reviews_count?: number;
  stock_quantity?: number;
  is_visible?: boolean;
  is_featured?: boolean;
  created_at?: string;
  images?: ProductImage[];
};

type ProductCardProps = {
  product: ProductCardProduct;
  onAddToCart?: (
    product: ProductCardProduct
  ) => void | Promise<{ ok: boolean; error?: string } | void>;
  onQuickView?: (product: ProductCardProduct) => void;
  badge?: "new" | "sale" | "featured" | "best-seller" | null;
  className?: string;
};

const NEW_PRODUCT_CUTOFF = Date.now() - 30 * 24 * 60 * 60 * 1000;

export const ProductCard = ({
  product,
  onAddToCart,
  onQuickView,
  badge,
  className,
}: ProductCardProps) => {
  const { isInWishlist, toggle } = useWishlist();
  const [added, setAdded] = useState(false);
  const images = product.images || [];
  const primary = images.find((img) => img.is_primary) || images[0];
  const secondary = images.find((img) => img !== primary) || primary;
  const price = product.sale_price ?? product.regular_price;
  const discount =
    product.sale_price && product.sale_price < product.regular_price
      ? Math.round(
          ((product.regular_price - product.sale_price) / product.regular_price) * 100
        )
      : 0;
  const outOfStock = (product.stock_quantity ?? 0) <= 0;
  const wished = isInWishlist(product.id);

  const handleAddToCart = async () => {
    const result = await onAddToCart?.(product);
    if (result?.ok !== false) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  const isNew =
    !!product.created_at && new Date(product.created_at).getTime() > NEW_PRODUCT_CUTOFF;

  const activeBadge = badge || (discount > 0 ? "sale" : isNew ? "new" : product.is_featured ? "featured" : null);
  const badgeStyles: Record<string, string> = {
    "new": "bg-emerald-500",
    "sale": "bg-rose-gold",
    "featured": "bg-gold-primary",
    "best-seller": "bg-purple-600",
  };
  const badgeLabels: Record<string, string> = {
    "new": "New",
    "sale": `-${discount}%`,
    "featured": "Featured",
    "best-seller": "Best Seller",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full overflow-hidden rounded-2xl bg-bg-card border border-border-custom hover-premium-card",
        "hover:border-gold-primary hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold-primary/10 transition-all duration-300",
        className
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-bg-secondary"
      >
        {primary && (
          <>
            <Image
              src={primary.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {secondary && secondary.image_url !== primary.image_url && (
              <Image
                src={secondary.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        )}

        {activeBadge && (
          <span
            className={cn(
              "absolute top-3 left-3 z-10 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm",
              badgeStyles[activeBadge]
            )}
          >
            {badgeLabels[activeBadge]}
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 z-10 bg-footer-bg/50 flex items-center justify-center">
            <span className="bg-bg-card text-text-primary text-sm font-semibold px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "p-2 rounded-full shadow-sm transition",
              wished
                ? "bg-rose-gold text-white"
                : "bg-bg-card/90 text-rose-gold hover:bg-rose-gold hover:text-white"
            )}
          >
            <Heart className={cn("w-4 h-4", wished && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            aria-label="Quick view"
            className="p-2 rounded-full bg-bg-card/90 text-gold-primary shadow-sm hover:bg-gold-primary hover:text-white transition"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="group/title">
          <h3 className="font-luxury text-lg text-text-primary leading-snug line-clamp-2 group-hover/title:text-gold-primary transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-2">
          <Star className="w-4 h-4 fill-gold-primary text-gold-primary" />
          <span className="text-sm text-text-primary font-medium">
            {(product.average_rating ?? 0).toFixed(1)}
          </span>
          <span className="text-xs text-text-secondary">
            ({product.reviews_count ?? 0})
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-luxury text-gold-primary">
              Rs. {Math.round(price).toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-xs line-through text-text-secondary">
                Rs. {Math.round(product.regular_price).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-primary text-white text-sm font-medium hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" />
          {outOfStock ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

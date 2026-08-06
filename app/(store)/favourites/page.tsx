"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";

export default function FavouritesPage() {
  const { ids, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (ids.length === 0) {
          if (!cancelled) setProducts([]);
          return;
        }
        const res = await fetch(`/api/products?ids=${ids.join(",")}`);
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
  }, [ids]);

  const visible = products.filter((p) => isInWishlist(p.id));

  return (
    <div className="bg-bg-primary min-h-screen">
      <div className="bg-bg-secondary border-b border-border-custom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Saved For Later
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary">
            My <span className="text-gold-primary italic">Favourites</span>
          </h1>
          <p className="text-text-secondary mt-3">
            Your personal wishlist — gifts you&apos;ve saved across the store
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-bg-card border border-border-custom aspect-[3/4]"></div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 mx-auto rounded-full bg-bg-secondary flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-gold-primary" />
            </div>
            <h2 className="text-2xl font-luxury text-text-primary mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-text-secondary mb-8">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
            >
              <ShoppingBag className="w-4 h-4" /> Explore Gifts
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-6">
              {visible.length} {visible.length === 1 ? "item" : "items"} saved
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {visible.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

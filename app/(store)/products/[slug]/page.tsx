"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Heart, Star, Share2, Truck, Check } from "lucide-react";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  description?: string;
  short_description?: string;
  average_rating: number;
  reviews_count: number;
  images: Array<{ id: number; image_url: string; is_primary: boolean }>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.data);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (quantity < 1 || quantity > product!.stock_quantity) {
      setCartMessage("Invalid quantity");
      return;
    }

    setAddingToCart(true);
    setCartMessage("");

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product!.id,
          quantity,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCartMessage("✓ Added to cart");
        setTimeout(() => {
          setCartMessage("");
        }, 2000);
      } else {
        setCartMessage(data.error || "Failed to add to cart");
      }
    } catch {
      setCartMessage("An error occurred");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-square bg-bg-card rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-bg-card rounded w-3/4"></div>
                <div className="h-6 bg-bg-card rounded w-1/2"></div>
                <div className="h-32 bg-bg-card rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-3xl font-luxury text-gold-primary mb-4">Product Not Found</h1>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Breadcrumb */}
      <div className="bg-bg-secondary border-b border-border-custom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gold-primary hover:text-gold-dark">
              Home
            </Link>
            <span className="text-text-secondary">/</span>
            <Link href="/shop" className="text-gold-primary hover:text-gold-dark">
              Shop
            </Link>
            <span className="text-text-secondary">/</span>
            <span className="text-text-primary">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-card border border-border-custom">
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage].image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-rose-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discount}%
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                      selectedImage === idx
                        ? "border-gold-primary"
                        : "border-border-custom hover:border-gold-primary"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl font-luxury text-text-primary mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.average_rating)
                          ? "fill-gold-primary text-gold-primary"
                          : "text-border-custom"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-text-secondary">
                  ({product.reviews_count} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-luxury text-gold-primary">
                  Rs. {Math.round(product.sale_price || product.regular_price).toLocaleString()}
                </span>
                {product.sale_price && (
                  <span className="text-2xl line-through text-text-secondary">
                    Rs. {Math.round(product.regular_price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary">SKU: {product.sku}</p>
            </div>

            {/* Description */}
            {product.short_description && (
              <p className="text-text-secondary">{product.short_description}</p>
            )}

            {/* Stock Status */}
            <div className={`px-4 py-3 rounded-lg border-2 ${
              product.stock_quantity > product.low_stock_threshold
                ? "bg-green-50 border-green-200 text-green-800"
                : product.stock_quantity > 0
                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              {product.stock_quantity > product.low_stock_threshold ? (
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>In Stock - Only {product.stock_quantity} left</span>
                </div>
              ) : product.stock_quantity > 0 ? (
                <span>Low Stock - Only {product.stock_quantity} available</span>
              ) : (
                <span>Out of Stock</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {product.stock_quantity > 0 && (
                <div className="flex items-center gap-4">
                  <label className="text-text-primary font-medium">Quantity:</label>
                  <div className="flex items-center border border-border-custom rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-text-primary hover:bg-bg-secondary"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.min(product.stock_quantity, Math.max(1, parseInt(e.target.value) || 1)))
                      }
                      className="w-16 text-center border-l border-r border-border-custom outline-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 py-2 text-text-primary hover:bg-bg-secondary"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {cartMessage && (
                <div className={`p-3 rounded-lg text-center text-sm ${
                  cartMessage.includes("✓")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {cartMessage}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || addingToCart}
                className="w-full py-4 px-6 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {addingToCart ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </button>

              <div className="flex gap-3">
                <button className="flex-1 py-3 px-6 border-2 border-gold-primary text-gold-primary font-medium rounded-lg hover:bg-gold-primary hover:text-white transition">
                  <Heart className="w-5 h-5 mx-auto" />
                </button>
                <button className="flex-1 py-3 px-6 border-2 border-gold-primary text-gold-primary font-medium rounded-lg hover:bg-gold-primary hover:text-white transition">
                  <Share2 className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t border-border-custom">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gold-primary" />
                <div>
                  <p className="font-medium text-text-primary">Free Delivery</p>
                  <p className="text-sm text-text-secondary">On orders over Rs. 5000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-gold-primary" />
                <div>
                  <p className="font-medium text-text-primary">Quality Guaranteed</p>
                  <p className="text-sm text-text-secondary">Premium products only</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-gold-primary" />
                <div>
                  <p className="font-medium text-text-primary">24/7 Support</p>
                  <p className="text-sm text-text-secondary">We&apos;re here to help</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="bg-bg-card border border-border-custom rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-luxury text-text-primary mb-4">About This Product</h2>
            <div className="text-text-secondary whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

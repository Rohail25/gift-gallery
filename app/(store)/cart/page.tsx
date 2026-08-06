"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus } from "lucide-react";
import { useSession } from "next-auth/react";

interface CartItem {
  id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product: {
    id: number;
    name: string;
    slug: string;
    regular_price: number;
    sale_price?: number;
    stock_quantity: number;
    images: Array<{ image_url: string; is_primary: boolean }>;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    setUpdating(itemId);
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-luxury text-gold-primary mb-8">Shopping Cart</h1>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 bg-bg-card p-4 rounded-lg border border-border-custom">
                <div className="w-24 h-24 bg-bg-secondary rounded"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-bg-secondary rounded w-3/4"></div>
                  <div className="h-4 bg-bg-secondary rounded w-1/2"></div>
                  <div className="h-6 bg-bg-secondary rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-luxury text-gold-primary mb-8">Shopping Cart</h1>
          <div className="text-center py-16 bg-bg-card rounded-lg border border-border-custom">
            <h2 className="text-2xl font-luxury text-text-primary mb-4">Your Cart is Empty</h2>
            <p className="text-text-secondary mb-8">Looks like you haven&apos;t added any items yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
          Your Selection
        </p>
        <h1 className="text-4xl font-luxury text-text-primary mb-8">
          Shopping <span className="text-gold-primary italic">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-bg-card p-4 rounded-lg border border-border-custom hover:border-gold-primary/50 transition"
              >
                {/* Product Image */}
                <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-bg-secondary">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-luxury text-lg text-text-primary hover:text-gold-primary transition"
                    >
                      {item.product.name}
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-lg font-luxury text-gold-primary">
                        Rs. {Math.round(item.unit_price).toLocaleString()}
                      </span>
                      {item.product.sale_price && (
                        <span className="text-sm text-text-secondary line-through">
                          Rs. {Math.round(item.product.regular_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="p-1 rounded-full border border-border-custom hover:bg-bg-secondary disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.product.stock_quantity}
                        className="p-1 rounded-full border border-border-custom hover:bg-bg-secondary disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="hidden md:flex flex-col justify-center items-end">
                  <span className="text-sm text-text-secondary">Line Total</span>
                  <span className="text-xl font-luxury text-gold-primary">
                    Rs. {Math.round(item.line_total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6 sticky top-4">
              <h2 className="text-xl font-luxury text-text-primary mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal ({cart.itemCount} items)</span>
                  <span className="font-medium">Rs. {Math.round(cart.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  <span className="text-sm text-gold-primary">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-border-custom pt-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="font-luxury text-text-primary">Total</span>
                  <span className="font-luxury text-gold-primary">Rs. {Math.round(cart.subtotal).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/shop"
                className="block text-center mt-4 text-gold-primary hover:text-gold-dark transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
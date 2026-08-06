"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Package, ArrowRight, ShoppingBag, Truck } from "lucide-react";

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: string | number;
  primary_image_url?: string | null;
}

interface Order {
  id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  grand_total: string | number;
  created_at: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default function MyOrdersPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/orders?limit=50");
        const data = await res.json();
        if (!cancelled) setOrders(data.data || []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-bg-card rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-bg-card rounded-2xl border border-border-custom animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
              Your Account
            </p>
            <h1 className="text-3xl md:text-4xl font-luxury text-text-primary">
              My <span className="text-gold-primary italic">Orders</span>
            </h1>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-primary hover:text-gold-dark transition"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-bg-card rounded-2xl border border-border-custom p-12 md:p-20 text-center">
            <Package className="w-16 h-16 mx-auto text-border-custom mb-5" />
            <h2 className="text-2xl font-luxury text-text-primary mb-2">No orders yet</h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              When you place an order, it will appear here so you can track it every step of the way.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const cover = order.items.find((i) => i.primary_image_url)?.primary_image_url;
              const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <div
                  key={order.id}
                  className="bg-bg-card rounded-2xl border border-border-custom overflow-hidden hover:border-gold-primary transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border-custom bg-bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-primary/10">
                        <Truck className="w-5 h-5 text-gold-primary" />
                      </span>
                      <div>
                        <p className="font-medium text-text-primary">{order.order_number}</p>
                        <p className="text-xs text-text-secondary">
                          Placed on {new Date(order.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[order.order_status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {statusLabel(order.order_status)}
                      </span>
                    </div>
                  </div>

                  <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {cover ? (
                        <span className="relative w-16 h-16 rounded-xl overflow-hidden bg-bg-secondary shrink-0">
                          <Image
                            src={cover}
                            alt={order.items[0]?.product_name || "Order item"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-bg-secondary shrink-0">
                          <Package className="w-7 h-7 text-border-custom" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary truncate">
                          {order.items[0]?.product_name}
                          {totalItems > 1 && (
                            <span className="text-text-secondary"> +{totalItems - 1} more</span>
                          )}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">{totalItems} item{totalItems > 1 ? "s" : ""}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div>
                        <p className="text-xs text-text-secondary">Order Total</p>
                        <p className="text-xl font-luxury text-gold-primary">
                          Rs. {Math.round(Number(order.grand_total)).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gold-primary border border-gold-primary rounded-full hover:bg-gold-primary hover:text-white transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

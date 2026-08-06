"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Package, ArrowLeft, Truck, CreditCard, MapPin, CheckCircle2 } from "lucide-react";

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
  subtotal: string | number;
  delivery_charge: string | number;
  discount_amount: string | number;
  grand_total: string | number;
  created_at: string;
  items: OrderItem[];
  delivery_address?: {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    city?: string;
  } | null;
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

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>();
  const { status: authStatus } = useSession();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/orders");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !params.orderNumber) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/orders/${params.orderNumber}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) setOrder(data.data || null);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authStatus, params.orderNumber]);

  if (authStatus === "loading" || (authStatus === "authenticated" && loading)) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-bg-card rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="h-64 bg-bg-card rounded-2xl border border-border-custom animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg-primary py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Package className="w-16 h-16 mx-auto text-border-custom mb-5" />
          <h1 className="text-2xl font-luxury text-text-primary mb-2">Order not found</h1>
          <p className="text-text-secondary mb-8">We couldn&apos;t find this order.</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-gold-primary hover:text-gold-dark transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>

        <div className="bg-bg-card rounded-2xl border border-border-custom p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
                Order Details
              </p>
              <h1 className="text-2xl md:text-3xl font-luxury text-text-primary">
                {order.order_number}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span
                className={`inline-flex px-4 py-1.5 text-xs font-medium rounded-full capitalize ${STATUS_STYLES[order.order_status] || "bg-gray-100 text-gray-800"}`}
              >
                {statusLabel(order.order_status)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <CreditCard className="w-3.5 h-3.5" />
                Payment: {statusLabel(order.payment_status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-bg-card rounded-2xl border border-border-custom overflow-hidden">
              <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
                <Package className="w-4 h-4 text-gold-primary" />
                <h2 className="font-luxury text-text-primary">Items</h2>
              </div>
              <ul className="divide-y divide-border-custom">
                {order.items.map((item) => (
                  <li key={item.id} className="px-6 py-4 flex items-center gap-4">
                    {item.primary_image_url ? (
                      <span className="relative w-14 h-14 rounded-xl overflow-hidden bg-bg-secondary shrink-0">
                        <Image
                          src={item.primary_image_url}
                          alt={item.product_name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                    ) : (
                      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-bg-secondary shrink-0">
                        <Package className="w-6 h-6 text-border-custom" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gold-primary">
                      Rs. {Math.round(Number(item.unit_price)).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-card rounded-2xl border border-border-custom p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-gold-primary" />
                <h2 className="font-luxury text-text-primary">Delivery Details</h2>
              </div>
              {order.delivery_address ? (
                <div className="flex items-start gap-3 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-gold-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-text-primary font-medium">
                      {order.delivery_address.full_name}
                    </p>
                    <p>{order.delivery_address.address_line1}</p>
                    <p>{order.delivery_address.city}</p>
                    <p>{order.delivery_address.phone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No delivery address provided.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-bg-card rounded-2xl border border-border-custom p-6">
              <h2 className="font-luxury text-text-primary mb-4">Order Summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Subtotal</dt>
                  <dd className="text-text-primary">Rs. {Math.round(Number(order.subtotal)).toLocaleString()}</dd>
                </div>
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-text-secondary">Discount</dt>
                    <dd className="text-green-700">
                      - Rs. {Math.round(Number(order.discount_amount)).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Delivery</dt>
                  <dd className="text-text-primary">Rs. {Math.round(Number(order.delivery_charge)).toLocaleString()}</dd>
                </div>
                <div className="border-t border-border-custom pt-3 flex justify-between items-center">
                  <dt className="font-medium text-text-primary">Total</dt>
                  <dd className="text-xl font-luxury text-gold-primary">
                    Rs. {Math.round(Number(order.grand_total)).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-bg-card rounded-2xl border border-border-custom p-6 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-gold-primary shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                Need help with this order? Contact our support team and mention your order number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

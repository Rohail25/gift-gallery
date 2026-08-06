"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bike,
  CheckCircle2,
  ClipboardList,
  MapPin,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  Phone,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliveryOtp {
  id: number;
  created_at: string;
  verified_at: string | null;
  invalidated_at: string | null;
  attempt_count: number;
}

interface RiderOrder {
  id: number;
  status: string;
  assigned_at: string;
  picked_up_at: string | null;
  completed_at: string | null;
  order: {
    id: number;
    order_number: string;
    order_status: string;
    payment_method: string;
    grand_total: string | number;
    placed_at: string;
    user: { full_name: string; phone: string | null };
    items: {
      product_name: string;
      quantity: number;
      unit_price: string | number;
      primary_image_url: string | null;
    }[];
    delivery_address: {
      full_name: string;
      phone: string;
      address_line_1: string;
      address_line_2?: string | null;
      city: string;
      area: string;
    } | null;
    deliveryOtps: DeliveryOtp[];
  };
}

const STATUS_STYLES: Record<string, string> = {
  assigned: "bg-blue-100 text-blue-700",
  accepted: "bg-indigo-100 text-indigo-700",
  picked_up: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function RiderDashboardPage() {
  const [assignments, setAssignments] = useState<RiderOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [otps, setOtps] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [accepting, setAccepting] = useState<number | null>(null);
  const [messages, setMessages] = useState<
    Record<number, { type: "success" | "error"; text: string }>
  >({});

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/rider/orders");
      const data = await res.json();
      if (res.ok) setAssignments(data.data || []);
    } catch {
      // ignore background refresh errors
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/rider/orders");
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(data.error || "Failed to load your orders");
        } else {
          setAssignments(data.data || []);
        }
      } catch {
        if (!cancelled) setLoadError("An unexpected error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(() => {
      if (!cancelled) refresh();
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refresh]);

  const handleAccept = async (orderId: number) => {
    setAccepting(orderId);
    setMessages((m) => ({ ...m, [orderId]: { type: "success", text: "" } }));
    try {
      const res = await fetch(`/api/rider/orders/${orderId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((m) => ({
          ...m,
          [orderId]: {
            type: "success",
            text: "Delivery accepted. The OTP is emailed to the customer once the admin marks the parcel as picked up.",
          },
        }));
        refresh();
      } else {
        setMessages((m) => ({
          ...m,
          [orderId]: {
            type: "error",
            text: data.error || "Failed to accept delivery",
          },
        }));
      }
    } catch {
      setMessages((m) => ({
        ...m,
        [orderId]: { type: "error", text: "An unexpected error occurred" },
      }));
    } finally {
      setAccepting(null);
    }
  };

  const handleVerify = async (orderId: number, otp: string) => {
    if (otp.length !== 6) return;
    setSubmitting(orderId);
    setMessages((m) => ({ ...m, [orderId]: { type: "success", text: "" } }));
    try {
      const res = await fetch("/api/rider/verify-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((m) => ({
          ...m,
          [orderId]: {
            type: "success",
            text: "Delivery confirmed! Order marked as delivered.",
          },
        }));
        setOtps((o) => ({ ...o, [orderId]: "" }));
        refresh();
      } else {
        setMessages((m) => ({
          ...m,
          [orderId]: { type: "error", text: data.error || "Verification failed" },
        }));
      }
    } catch {
      setMessages((m) => ({
        ...m,
        [orderId]: { type: "error", text: "An unexpected error occurred" },
      }));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-secondary">
        Loading your deliveries...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
        {loadError}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto w-16 h-16 rounded-full bg-bg-card flex items-center justify-center mb-4">
          <Bike className="w-8 h-8 text-text-secondary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          No deliveries assigned yet
        </h2>
        <p className="mt-2 text-text-secondary">
          When the admin assigns an order to you, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-luxury text-gold-primary">
          Rider Dashboard
        </h1>
        <p className="mt-1 text-text-secondary">
          {assignments.length} assigned{" "}
          {assignments.length === 1 ? "delivery" : "deliveries"}
        </p>
      </div>

      <div className="space-y-6">
        {assignments.map((a) => {
          const latestOtp = a.order.deliveryOtps[0] || null;
          const isDelivered = a.order.order_status === "delivered";
          const isCancelled =
            a.status === "cancelled" || a.order.order_status === "cancelled";
          const otpVerified = latestOtp?.verified_at != null;
          const hasActiveOtp =
            latestOtp != null &&
            latestOtp.verified_at == null &&
            latestOtp.invalidated_at == null;
          const canVerify =
            !isDelivered &&
            !isCancelled &&
            !otpVerified &&
            (a.status === "accepted" || a.status === "picked_up");

          return (
            <div
              key={a.id}
              className="bg-bg-card border border-border-custom rounded-xl shadow-sm overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-border-custom">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-primary/10 text-gold-primary flex items-center justify-center">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {a.order.order_number}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(a.order.placed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${STATUS_STYLES[a.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {a.status.replace("_", " ")}
                </span>
              </div>

              <div className="px-5 py-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {a.order.delivery_address?.full_name ||
                        a.order.user.full_name}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {a.order.delivery_address?.phone || a.order.user.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                      Amount
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      Rs. {a.order.grand_total}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary capitalize">
                      {a.order.payment_method} · {a.order.order_status.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {a.order.delivery_address && (
                  <div className="flex items-start gap-2 text-sm text-text-secondary">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold-primary" />
                    <span>
                      {a.order.delivery_address.address_line_1}
                      {a.order.delivery_address.address_line_2
                        ? `, ${a.order.delivery_address.address_line_2}`
                        : ""}
                      , {a.order.delivery_address.area},{" "}
                      {a.order.delivery_address.city}
                    </span>
                  </div>
                )}

                {a.order.items && a.order.items.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">
                      Items
                    </p>
                    <ul className="space-y-1.5">
                      {a.order.items.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm text-text-primary"
                        >
                          <span className="text-gold-primary font-medium">
                            {item.quantity}×
                          </span>
                          <span className="truncate">{item.product_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {isDelivered ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <PackageCheck className="w-5 h-5" />
                    Delivered
                  </div>
                ) : isCancelled ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <XCircle className="w-5 h-5" />
                    Cancelled
                  </div>
                ) : hasActiveOtp ? (
                  <div className="p-4 rounded-lg bg-bg-secondary border border-border-custom">
                    <p className="text-sm font-medium text-text-primary mb-3">
                      Confirm Delivery — ask the customer for the 6-digit OTP
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otps[a.order.id] || ""}
                        onChange={(e) =>
                          setOtps((o) => ({
                            ...o,
                            [a.order.id]: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                        placeholder="6-digit OTP"
                        className="w-full sm:w-40 px-4 py-2.5 rounded-lg border border-border-custom text-center tracking-[0.4em] text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          handleVerify(a.order.id, (otps[a.order.id] || "").trim())
                        }
                        disabled={
                          submitting === a.order.id ||
                          (otps[a.order.id] || "").length !== 6
                        }
                        size="lg"
                      >
                        {submitting === a.order.id
                          ? "Verifying..."
                          : "Confirm Delivery"}
                      </Button>
                    </div>
                    {messages[a.order.id]?.text && (
                      <p
                        className={`mt-3 text-sm ${
                          messages[a.order.id].type === "success"
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {messages[a.order.id].text}
                      </p>
                    )}
                  </div>
                ) : a.status === "assigned" ? (
                  <div className="p-4 rounded-lg bg-bg-secondary border border-border-custom">
                    <p className="text-sm font-medium text-text-primary mb-3">
                      A new delivery has been assigned to you.
                    </p>
                    <Button
                      type="button"
                      onClick={() => handleAccept(a.order.id)}
                      disabled={accepting === a.order.id}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {accepting === a.order.id ? (
                        "Accepting..."
                      ) : (
                        <>
                          <PackagePlus className="w-4 h-4" />
                          Accept Delivery
                        </>
                      )}
                    </Button>
                    {messages[a.order.id]?.text && (
                      <p
                        className={`mt-3 text-sm ${
                          messages[a.order.id].type === "success"
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {messages[a.order.id].text}
                      </p>
                    )}
                  </div>
                ) : canVerify ? (
                  <div className="p-4 rounded-lg bg-bg-secondary border border-border-custom">
                    <p className="text-sm font-medium text-text-primary mb-3">
                      Confirm Delivery — ask the customer for the 6-digit OTP
                    </p>
                    {latestOtp ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otps[a.order.id] || ""}
                          onChange={(e) =>
                            setOtps((o) => ({
                              ...o,
                              [a.order.id]: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="6-digit OTP"
                          className="w-full sm:w-40 px-4 py-2.5 rounded-lg border border-border-custom text-center tracking-[0.4em] text-lg font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        />
                        <Button
                          type="button"
                          onClick={() =>
                            handleVerify(a.order.id, (otps[a.order.id] || "").trim())
                          }
                          disabled={
                            submitting === a.order.id ||
                            (otps[a.order.id] || "").length !== 6
                          }
                          size="lg"
                        >
                          {submitting === a.order.id
                            ? "Verifying..."
                            : "Confirm Delivery"}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        No OTP yet. It is emailed to the customer once the admin
                        marks the parcel as picked up.
                      </p>
                    )}
                    {messages[a.order.id]?.text && (
                      <p
                        className={`mt-3 text-sm ${
                          messages[a.order.id].type === "success"
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {messages[a.order.id].text}
                      </p>
                    )}
                  </div>
                ) : otpVerified ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Delivery OTP verified
                  </div>
                ) : a.status === "accepted" ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                    <PackageOpen className="w-5 h-5" />
                    Awaiting pickup — the OTP is sent when the admin marks the
                    parcel as picked up.
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

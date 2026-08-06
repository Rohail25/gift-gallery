"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Package, CreditCard, Truck, MessageSquareText } from "lucide-react";

interface OrderDetail {
  id: number;
  order_number: string;
  order_status: string;
  payment_method: string;
  payment_status: string;
  subtotal: string | number;
  delivery_charge: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  customer_note?: string | null;
  created_at: string;
  delivered_at?: string | null;
  user: { id: number; full_name: string; email: string; phone?: string | null };
  delivery_zone: { name: string; city: string; area: string };
  delivery_address?: {
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string | null;
    city: string;
    area: string;
    postal_code?: string | null;
  } | null;
  items: Array<{
    id: number;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: string | number;
    line_total: string | number;
    primary_image_url?: string | null;
  }>;
  payments: Array<{
    id: number;
    payment_method: string;
    amount: string | number;
    status: string;
    paid_at?: string | null;
  }>;
  status_history: Array<{
    id: number;
    previous_status: string;
    new_status: string;
    note?: string | null;
    created_at: string;
    changed_by_user?: { full_name: string } | null;
  }>;
  orderRiderAssignments: Array<{
    id: number;
    status: string;
    assigned_at: string;
    accepted_at?: string | null;
    picked_up_at?: string | null;
    completed_at?: string | null;
    rider_user: { full_name: string; phone?: string | null };
  }>;
  deliveryOtps: Array<{
    id: number;
    expires_at: string;
    attempt_count: number;
    verified_at?: string | null;
    invalidated_at?: string | null;
    created_at: string;
  }>;
}

interface RiderOption {
  id: number;
  full_name: string;
  phone?: string | null;
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [riders, setRiders] = useState<RiderOption[]>([]);
  const [selectedRider, setSelectedRider] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            setError(data.error || "Order not found");
            return;
          }
          setOrder(data.data);
        }
      } catch {
        if (!cancelled) setError("An error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, reloadKey]);

  useEffect(() => {
    let cancelled = false;

    async function loadRiders() {
      try {
        const res = await fetch("/api/admin/riders?limit=100");
        const data = await res.json();
        if (!cancelled) {
          setRiders(data.data || []);
          if (data.data?.length === 1) setSelectedRider(String(data.data[0].id));
        }
      } catch (error) {
        console.error("Error fetching riders:", error);
      }
    }

    loadRiders();
    return () => {
      cancelled = true;
    };
  }, []);

  const reload = () => setReloadKey((k) => k + 1);

  const handleAssignRider = async () => {
    if (!order || !selectedRider) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch("/api/rider/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, riderUserId: parseInt(selectedRider) }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: "Rider assigned successfully" });
        reload();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to assign rider" });
      }
    } catch {
      setActionMessage({ type: "error", text: "An error occurred" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/delivery-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: "Delivery OTP sent to customer email" });
        reload();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to send OTP" });
      }
    } catch {
      setActionMessage({ type: "error", text: "An error occurred" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!order) return;
    if (!confirm("Mark this order as delivered? This will record payment as paid.")) return;
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/mark-delivered`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: "success", text: data.message || "Order marked as delivered" });
        reload();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to update order" });
      }
    } catch {
      setActionMessage({ type: "error", text: "An error occurred" });
    } finally {
      setActionLoading(false);
    }
  };

  const latestOtp = order?.deliveryOtps?.[0] || null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-bg-secondary rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold-primary transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </Link>
        <div className="bg-bg-card rounded-lg border border-border-custom p-12 text-center text-text-secondary">
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready_for_pickup: "bg-indigo-100 text-indigo-800",
      assigned_to_rider: "bg-cyan-100 text-cyan-800",
      picked_up: "bg-teal-100 text-teal-800",
      on_the_way: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-bg-secondary rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-luxury text-gold-primary">{order.order_number}</h1>
          <p className="text-text-secondary mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${getStatusBadge(order.order_status)}`}>
          {order.order_status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border-custom">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">SKU</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-primary">Qty</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-text-primary">Unit Price</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-text-primary">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text-primary">{item.product_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                          {item.product_sku}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-text-primary">
                        Rs. {Number(item.unit_price).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-text-primary">
                        Rs. {Number(item.line_total).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Payments</h2>
            </div>
            <div className="divide-y divide-border-custom">
              {order.payments.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-text-secondary">No payments recorded</p>
              ) : (
                order.payments.map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary capitalize">
                        {payment.payment_method}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {payment.paid_at
                          ? `Paid ${new Date(payment.paid_at).toLocaleString()}`
                          : "Not paid yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status}
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        Rs. {Number(payment.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Status History</h2>
            </div>
            <div className="divide-y divide-border-custom">
              {order.status_history.map((entry) => (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-primary">
                      <span className="capitalize">{entry.previous_status.replace(/_/g, " ")}</span>
                      <span className="mx-2 text-gold-primary">→</span>
                      <span className="capitalize">{entry.new_status.replace(/_/g, " ")}</span>
                    </p>
                    <span className="text-xs text-text-secondary">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  {(entry.note || entry.changed_by_user) && (
                    <p className="text-xs text-text-secondary mt-1">
                      {entry.note}
                      {entry.changed_by_user ? ` - by ${entry.changed_by_user.full_name}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <h2 className="text-lg font-luxury text-text-primary mb-4">Customer</h2>
            <Link href={`/admin/users/${order.user.id}`} className="hover:underline">
              <p className="font-medium text-text-primary">{order.user.full_name}</p>
              <p className="text-sm text-text-secondary">{order.user.email}</p>
              {order.user.phone && (
                <p className="text-sm text-text-secondary">{order.user.phone}</p>
              )}
            </Link>
          </div>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <h2 className="text-lg font-luxury text-text-primary mb-4">Delivery</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold-primary shrink-0" />
              <div className="text-sm">
                {order.delivery_address ? (
                  <>
                    <p className="font-medium text-text-primary">{order.delivery_address.full_name}</p>
                    <p className="text-text-secondary">{order.delivery_address.phone}</p>
                    <p className="text-text-secondary mt-1">
                      {order.delivery_address.address_line_1}
                      {order.delivery_address.address_line_2
                        ? `, ${order.delivery_address.address_line_2}`
                        : ""}
                    </p>
                    <p className="text-text-secondary">
                      {order.delivery_address.area}, {order.delivery_address.city}
                    </p>
                  </>
                ) : (
                  <p className="text-text-secondary">No delivery address</p>
                )}
                <p className="text-text-secondary mt-2">
                  Zone: {order.delivery_zone.name}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-gold-primary shrink-0" />
              <h2 className="text-lg font-luxury text-text-primary">Delivery &amp; Rider</h2>
            </div>

            {order.orderRiderAssignments && order.orderRiderAssignments.length > 0 ? (
              <div className="space-y-3">
                {order.orderRiderAssignments.map((assignment) => (
                  <div key={assignment.id} className="border border-border-custom rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">
                        {assignment.rider_user.full_name}
                      </p>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          assignment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : assignment.status === "picked_up"
                            ? "bg-teal-100 text-teal-800"
                            : assignment.status === "accepted"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-cyan-100 text-cyan-800"
                        }`}
                      >
                        {assignment.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {assignment.rider_user.phone && (
                      <p className="text-xs text-text-secondary mt-1">
                        {assignment.rider_user.phone}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary mt-1">
                      Assigned: {new Date(assignment.assigned_at).toLocaleString()}
                    </p>
                    {assignment.accepted_at && (
                      <p className="text-xs text-text-secondary">
                        Accepted: {new Date(assignment.accepted_at).toLocaleString()}
                      </p>
                    )}
                    {assignment.picked_up_at && (
                      <p className="text-xs text-text-secondary">
                        Picked up: {new Date(assignment.picked_up_at).toLocaleString()}
                      </p>
                    )}
                    {assignment.completed_at && (
                      <p className="text-xs text-text-secondary">
                        Completed: {new Date(assignment.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary">No rider assigned yet.</p>
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full px-3 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white text-sm"
                >
                  <option value="">Select a rider...</option>
                  {riders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.full_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignRider}
                  disabled={actionLoading || !selectedRider}
                  className="w-full py-2 bg-gold-primary text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition disabled:opacity-50"
                >
                  Assign Rider
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border-custom">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="w-4 h-4 text-gold-primary" />
                <h3 className="text-sm font-medium text-text-primary">Delivery OTP</h3>
              </div>
              {latestOtp ? (
                <div className="space-y-1 text-xs text-text-secondary">
                  {latestOtp.verified_at ? (
                    <p className="text-green-700 font-medium">
                      Verified {new Date(latestOtp.verified_at).toLocaleString()}
                    </p>
                  ) : latestOtp.invalidated_at ? (
                    <p className="text-text-secondary">
                      Replaced {new Date(latestOtp.invalidated_at).toLocaleString()}
                    </p>
                  ) : (
                    <p className="font-medium text-text-primary">Active — no expiry</p>
                  )}
                  <p>Sent: {new Date(latestOtp.created_at).toLocaleString()}</p>
                  <p>Failed attempts: {latestOtp.attempt_count}</p>
                </div>
              ) : (
                <p className="text-xs text-text-secondary">
                  No OTP sent yet. It is emailed to the customer automatically when the parcel is
                  picked up.
                </p>
              )}

              <div className="mt-3 space-y-2">
                <button
                  onClick={handleSendOtp}
                  disabled={actionLoading || order.order_status === "delivered"}
                  className="w-full py-2 border border-gold-primary text-gold-primary rounded-lg text-sm font-medium hover:bg-gold-primary hover:text-white transition disabled:opacity-50"
                >
                  {latestOtp ? "Resend OTP Email" : "Send OTP Email"}
                </button>
                {order.order_status !== "delivered" && (
                  <button
                    onClick={handleMarkDelivered}
                    disabled={actionLoading}
                    className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>

            {actionMessage && (
              <p
                className={`mt-3 text-xs rounded-lg p-2 ${
                  actionMessage.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {actionMessage.text}
              </p>
            )}
          </div>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <h2 className="text-lg font-luxury text-text-primary mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary">Rs. {Number(order.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Delivery Charge</span>
                <span className="text-text-primary">Rs. {Number(order.delivery_charge).toLocaleString()}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Discount</span>
                  <span className="text-green-600">- Rs. {Number(order.discount_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax</span>
                <span className="text-text-primary">Rs. {Number(order.tax_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border-custom">
                <span className="font-medium text-text-primary">Grand Total</span>
                <span className="font-luxury text-gold-primary text-lg">
                  Rs. {Number(order.grand_total).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-text-secondary">Payment</span>
                <span className="text-text-primary capitalize">{order.payment_method}</span>
              </div>
            </div>
          </div>

          {order.customer_note && (
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-lg font-luxury text-text-primary mb-2">Customer Note</h2>
              <p className="text-sm text-text-secondary">{order.customer_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

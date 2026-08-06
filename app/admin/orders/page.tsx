"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { getOrderStatusColor, formatCurrency, formatDateTime } from "@/lib/utils";

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  delivery_charge: number;
  grand_total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  placed_at: string;
  items: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  user: {
    full_name: string;
    email: string;
    phone?: string;
  };
  delivery_address: {
    full_name: string;
    phone: string;
    address_line_1: string;
    city: string;
    area: string;
  } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (search) params.append("search", search);

        const res = await fetch(`/api/admin/orders?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setOrders(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, search]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (!confirm(`Change order status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(orders.map((o) => (o.id === orderId ? data.data : o)));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
      case "preparing":
        return <Package className="w-4 h-4" />;
      case "on_the_way":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Orders</h1>
          <p className="text-text-secondary mt-1">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-card rounded-lg border border-border-custom p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Order number, customer name..."
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Order Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="assigned_to_rider">Assigned to Rider</option>
              <option value="on_the_way">On The Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg hover:bg-bg-secondary transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Order #</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Items</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.order_status)}
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-gold-primary hover:text-gold-dark"
                        >
                          #{order.order_number}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{order.user.full_name}</p>
                        <p className="text-sm text-text-secondary">{order.user.email}</p>
                        {order.delivery_address && (
                          <p className="text-xs text-text-secondary mt-1">
                            {order.delivery_address.city}, {order.delivery_address.area}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary font-medium">
                          {order.items.length} {order.items.length === 1 ? "item" : "items"}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {order.items.slice(0, 2).map((item) => item.product_name).join(", ")}
                          {order.items.length > 2 && "..."}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-text-primary">
                        {formatCurrency(order.grand_total)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          order.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {order.payment_status}
                        </span>
                        <p className="text-xs text-text-secondary mt-1 uppercase">
                          {order.payment_method}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-gold-primary ${getOrderStatusColor(order.order_status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready_for_pickup">Ready</option>
                        <option value="assigned_to_rider">Assigned</option>
                        <option value="picked_up">Picked Up</option>
                        <option value="on_the_way">On The Way</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-primary">
                        {new Date(order.placed_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(order.placed_at).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-custom">
            <div className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Orders</p>
          <p className="text-2xl font-luxury text-gold-primary">{orders.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Pending</p>
          <p className="text-2xl font-luxury text-yellow-600">
            {orders.filter((o) => o.order_status === "pending").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Preparing</p>
          <p className="text-2xl font-luxury text-blue-600">
            {orders.filter((o) => o.order_status === "preparing").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">On The Way</p>
          <p className="text-2xl font-luxury text-orange-600">
            {orders.filter((o) => o.order_status === "on_the_way").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Delivered</p>
          <p className="text-2xl font-luxury text-green-600">
            {orders.filter((o) => o.order_status === "delivered").length}
          </p>
        </div>
      </div>
    </div>
  );
}

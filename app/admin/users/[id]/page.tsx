"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Package, Calendar, Star, ShoppingBag } from "lucide-react";

interface UserDetail {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  email_verified_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
  addresses: Array<{
    id: number;
    label?: string | null;
    full_name: string;
    phone: string;
    address_line_1: string;
    city: string;
    area: string;
    is_default: boolean;
  }>;
  _count?: { orders: number; productReviews: number; bookings: number };
  recent_orders: Array<{
    id: number;
    order_number: string;
    order_status: string;
    grand_total: string | number;
    created_at: string;
    delivery_zone: { name: string };
  }>;
  recent_bookings: Array<{
    id: number;
    booking_number: string;
    booking_status: string;
    event_date: string;
    decor_package: { name: string };
  }>;
  recent_reviews: Array<{
    id: number;
    rating: number;
    description: string;
    status: string;
    product: { name: string };
  }>;
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) {
            setError(data.error || "User not found");
            return;
          }
          setUser(data.data);
        }
      } catch (error) {
        if (!cancelled) setError("An error occurred");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

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

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link href="/admin/users" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold-primary transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Users
        </Link>
        <div className="bg-bg-card rounded-lg border border-border-custom p-12 text-center text-text-secondary">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      blocked: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-bg-secondary rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-luxury text-gold-primary">{user.full_name}</h1>
          <p className="text-text-secondary mt-1">
            {user.email} {user.phone ? `- ${user.phone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-bg-secondary text-text-primary uppercase">
            {user.role}
          </span>
          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(user.status)}`}>
            {user.status}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <ShoppingBag className="w-4 h-4" />
            Orders
          </div>
          <p className="text-2xl font-luxury text-gold-primary">{user._count?.orders || 0}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <Calendar className="w-4 h-4" />
            Decor Bookings
          </div>
          <p className="text-2xl font-luxury text-gold-primary">{user._count?.bookings || 0}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <Star className="w-4 h-4" />
            Reviews
          </div>
          <p className="text-2xl font-luxury text-gold-primary">{user._count?.productReviews || 0}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
            <MapPin className="w-4 h-4" />
            Saved Addresses
          </div>
          <p className="text-2xl font-luxury text-gold-primary">{user.addresses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <Package className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Recent Orders</h2>
            </div>
            <div className="divide-y divide-border-custom">
              {user.recent_orders.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-text-secondary">No orders yet</p>
              ) : (
                user.recent_orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-bg-secondary/50 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-text-primary">{order.order_number}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(order.created_at).toLocaleDateString()} - {order.delivery_zone.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-text-primary">
                        Rs. {Number(order.grand_total).toLocaleString()}
                      </span>
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-bg-secondary text-text-primary capitalize">
                        {order.order_status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <Star className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Recent Reviews</h2>
            </div>
            <div className="divide-y divide-border-custom">
              {user.recent_reviews.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-text-secondary">No reviews yet</p>
              ) : (
                user.recent_reviews.map((review) => (
                  <div key={review.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-primary">{review.product.name}</p>
                      <span className="text-sm text-gold-primary">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 line-clamp-1">{review.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
            <div className="px-6 py-4 border-b border-border-custom flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-primary" />
              <h2 className="text-lg font-luxury text-text-primary">Saved Addresses</h2>
            </div>
            <div className="divide-y divide-border-custom">
              {user.addresses.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-text-secondary">No saved addresses</p>
              ) : (
                user.addresses.map((address) => (
                  <div key={address.id} className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-text-primary">{address.label || address.full_name}</p>
                      {address.is_default && (
                        <span className="text-xs bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      {address.address_line_1}, {address.area}, {address.city}
                    </p>
                    <p className="text-xs text-text-secondary">{address.phone}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <h2 className="text-lg font-luxury text-text-primary mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary">Member Since</p>
                <p className="text-text-primary">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-text-secondary">Email Verified</p>
                <p className="text-text-primary">
                  {user.email_verified_at
                    ? new Date(user.email_verified_at).toLocaleDateString()
                    : "No"}
                </p>
              </div>
              <div>
                <p className="text-text-secondary">Last Login</p>
                <p className="text-text-primary">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <h2 className="text-lg font-luxury text-text-primary mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {user.recent_bookings.length === 0 ? (
                <p className="text-sm text-text-secondary">No bookings yet</p>
              ) : (
                user.recent_bookings.map((booking) => (
                  <div key={booking.id} className="text-sm">
                    <p className="font-medium text-text-primary">{booking.decor_package.name}</p>
                    <p className="text-xs text-text-secondary">
                      {booking.booking_number} - {new Date(booking.event_date).toLocaleDateString()}
                    </p>
                    <span className="inline-flex px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-bg-secondary text-text-primary capitalize">
                      {booking.booking_status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

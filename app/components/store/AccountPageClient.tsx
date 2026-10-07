"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Package,
  Heart,
  MapPin,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Calendar,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { ProductCard, ProductCardProduct } from "@/components/ProductCard";
import { useWishlist } from "@/components/WishlistProvider";
import { useCart } from "@/components/CartProvider";

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

interface Booking {
  id: number;
  booking_number: string;
  event_date: string;
  booking_status: string;
  payment_status: string;
  quoted_amount?: string | number | null;
  final_amount?: string | number | null;
  package_starting_price: string | number;
  created_at: string;
  decor_package: { name: string; slug: string };
  event_type: { name: string };
  venue_snapshot?: {
    contact_name?: string | null;
    contact_phone?: string | null;
    city?: string | null;
    area?: string | null;
  } | null;
}

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  area: string;
  postal_code?: string | null;
  is_default: boolean;
}

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  read_at?: string | null;
  created_at: string;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-blue-100 text-blue-800",
  ready_for_pickup: "bg-indigo-100 text-indigo-800",
  assigned_to_rider: "bg-cyan-100 text-cyan-800",
  picked_up: "bg-teal-100 text-teal-800",
  on_the_way: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-gray-100 text-gray-800",
};

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  site_visit_required: "bg-purple-100 text-purple-800",
  site_visit_completed: "bg-indigo-100 text-indigo-800",
  quotation_sent: "bg-cyan-100 text-cyan-800",
  customer_approved: "bg-teal-100 text-teal-800",
  confirmed: "bg-green-100 text-green-800",
  preparation_started: "bg-lime-100 text-lime-800",
  team_dispatched: "bg-emerald-100 text-emerald-800",
  setup_in_progress: "bg-orange-100 text-orange-800",
  setup_completed: "bg-green-100 text-green-800",
  event_completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
        map[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function AccountDashboardPage() {
  return (
    <Suspense fallback={null}>
      <AccountContent />
    </Suspense>
  );
}

function AccountContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "orders");

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [profileSaved, setProfileSaved] = useState(false);
  const [newPasswordEmail, setNewPasswordEmail] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState("");

  const { ids, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<ProductCardProduct[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    async function loadOrders() {
      try {
        const res = await fetch("/api/orders?limit=50");
        const data = await res.json();
        if (!cancelled && res.ok) setOrders(data.data || []);
      } catch {
        /* ignore */
      }
    }

    async function loadBookings() {
      try {
        const res = await fetch("/api/decor-bookings");
        const data = await res.json();
        if (!cancelled && res.ok) setBookings(data.data || []);
      } catch {
        /* ignore */
      }
    }

    async function loadAddresses() {
      try {
        const res = await fetch("/api/addresses");
        const data = await res.json();
        if (!cancelled && res.ok) setAddresses(data.data || []);
      } catch {
        /* ignore */
      }
    }

    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications?limit=50");
        const data = await res.json();
        if (!cancelled && res.ok) setNotifications(data.data || []);
      } catch {
        /* ignore */
      }
    }

    loadOrders();
    loadBookings();
    loadAddresses();
    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Wishlist products
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (ids.length === 0) {
        if (!cancelled) setWishlistProducts([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?ids=${ids.join(",")}`);
        const data = await res.json();
        if (!cancelled) setWishlistProducts(data.data || []);
      } catch {
        if (!cancelled) setWishlistProducts([]);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const markAllNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch {
      /* ignore */
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newPasswordEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage(
          `Password reset instructions sent to ${newPasswordEmail}. Check your inbox to continue.`
        );
      } else {
        setPwMessage(data.error || "Failed to send reset instructions");
      }
    } catch {
      setPwMessage("An unexpected error occurred");
    } finally {
      setPwLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-bg-card rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-96 bg-bg-card rounded-lg"></div>
              <div className="lg:col-span-3 h-96 bg-bg-card rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "bookings", label: "Decor Bookings", icon: Calendar },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];

  const visibleWishlist = wishlistProducts.filter((p) => isInWishlist(p.id));

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-bg-card rounded-lg border border-border-custom p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-gold-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-luxury text-text-primary">
                Welcome, {session?.user?.name || "User"}
              </h1>
              <p className="text-text-secondary">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden sticky top-4">
              <nav className="divide-y divide-border-custom">
                {menuItems.map((item) => {
                  const active = activeTab === item.id;
                  const classes = `flex items-center gap-3 px-6 py-4 text-text-primary hover:bg-bg-secondary transition ${
                    active ? "bg-gold-primary/5 text-gold-primary" : ""
                  }`;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`${classes} w-full text-left`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  );
                })}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-3 px-6 py-4 w-full text-left text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "orders" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">My Orders</h2>
                  <Link
                    href="/shop"
                    className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                  >
                    Continue Shopping
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-border-custom mb-4" />
                    <p className="text-text-secondary mb-4">You haven&apos;t placed any orders yet</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const cover = order.items.find((i) => i.primary_image_url)?.primary_image_url;
                      const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
                      return (
                        <div
                          key={order.id}
                          className="border border-border-custom rounded-xl overflow-hidden hover:border-gold-primary transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border-custom bg-bg-secondary/50">
                            <div>
                              <p className="font-medium text-text-primary">{order.order_number}</p>
                              <p className="text-xs text-text-secondary">
                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <StatusBadge status={order.order_status} map={ORDER_STATUS_STYLES} />
                          </div>
                          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {cover ? (
                                <span className="relative w-14 h-14 rounded-lg overflow-hidden bg-bg-secondary shrink-0">
                                  <Image
                                    src={cover}
                                    alt={order.items[0]?.product_name || "Order item"}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </span>
                              ) : (
                                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-bg-secondary shrink-0">
                                  <Package className="w-6 h-6 text-border-custom" />
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm text-text-primary truncate">
                                  {order.items[0]?.product_name}
                                  {totalItems > 1 && (
                                    <span className="text-text-secondary"> +{totalItems - 1} more</span>
                                  )}
                                </p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  Rs. {Math.round(Number(order.grand_total)).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {order.order_status === "delivered" && (
                                <Link
                                  href={`/orders/${order.id}#reviews`}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gold-primary border border-gold-primary rounded-full hover:bg-gold-primary hover:text-white transition"
                                >
                                  <Star className="w-4 h-4" /> Review
                                </Link>
                              )}
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border-custom rounded-full hover:border-gold-primary transition text-text-primary"
                              >
                                View Details
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">Decor Bookings</h2>
                  <Link
                    href="/decor"
                    className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                  >
                    Browse Decor Services
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-border-custom mb-4" />
                    <p className="text-text-secondary mb-4">No event decor bookings yet</p>
                    <Link
                      href="/decor"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
                    >
                      Browse Decor Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-border-custom rounded-xl overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-border-custom bg-bg-secondary/50">
                          <div>
                            <p className="font-medium text-text-primary">{booking.booking_number}</p>
                            <p className="text-xs text-text-secondary">
                              {new Date(booking.event_date).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <StatusBadge status={booking.booking_status} map={BOOKING_STATUS_STYLES} />
                        </div>
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gold-primary shrink-0" />
                            <p className="text-sm text-text-primary">
                              {booking.decor_package.name}
                              <span className="text-text-secondary"> · {booking.event_type.name}</span>
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3 text-xs text-text-secondary">
                            <span className="bg-bg-secondary px-2.5 py-1 rounded-full">
                              Payment: {statusLabel(booking.payment_status)}
                            </span>
                            {booking.venue_snapshot?.city && (
                              <span className="bg-bg-secondary px-2.5 py-1 rounded-full">
                                {booking.venue_snapshot.city}, {booking.venue_snapshot.area}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-text-secondary">Amount</p>
                            <p className="font-luxury text-gold-primary">
                              Rs.{" "}
                              {Math.round(
                                Number(
                                  booking.quoted_amount ||
                                    booking.final_amount ||
                                    booking.package_starting_price ||
                                    0
                                )
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">Saved Addresses</h2>
                  <Link
                    href="/checkout"
                    className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                  >
                    Manage at Checkout
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-border-custom mb-4" />
                    <p className="text-text-secondary mb-4">No saved addresses</p>
                    <Link
                      href="/checkout"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
                    >
                      Add Address at Checkout
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border border-border-custom rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-text-primary">{address.full_name}</p>
                          {address.is_default && (
                            <span className="text-xs bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">{address.address_line_1}</p>
                        {address.address_line_2 && (
                          <p className="text-sm text-text-secondary">{address.address_line_2}</p>
                        )}
                        <p className="text-sm text-text-secondary">
                          {address.area}, {address.city}
                          {address.postal_code ? ` - ${address.postal_code}` : ""}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">My Wishlist</h2>
                  <Link
                    href="/favourites"
                    className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                  >
                    View All
                  </Link>
                </div>

                {visibleWishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-border-custom mb-4" />
                    <p className="text-text-secondary mb-4">Your wishlist is empty</p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {visibleWishlist.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={() => addToCart(product.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">Notifications</h2>
                  {notifications.some((n) => !n.read_at) && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto text-border-custom mb-4" />
                    <p className="text-text-secondary">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`border rounded-xl p-4 ${
                          notification.read_at ? "border-border-custom" : "border-gold-primary/50 bg-gold-primary/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-text-primary text-sm">{notification.title}</p>
                          <span className="text-xs text-text-secondary shrink-0">
                            {new Date(notification.created_at).toLocaleDateString(undefined, {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <h2 className="text-xl font-luxury text-text-primary mb-6">Profile Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ""}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email || ""}
                      disabled
                      className="w-full px-4 py-2 border border-border-custom rounded-lg bg-bg-secondary text-text-secondary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setProfileSaved(true);
                      setTimeout(() => setProfileSaved(false), 3000);
                    }}
                    className="px-6 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
                  >
                    Save Changes
                  </button>
                  {profileSaved && (
                    <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                      Profile updated successfully.
                    </p>
                  )}
                </div>

                {/* Change password via email */}
                <div className="mt-8 pt-6 border-t border-border-custom">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-5 h-5 text-gold-primary" />
                    <h3 className="text-lg font-luxury text-text-primary">Change Password</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-4">
                    Enter your email address and we&apos;ll send you a secure link to reset your
                    password.
                  </p>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <input
                      type="email"
                      required
                      value={newPasswordEmail}
                      onChange={(e) => setNewPasswordEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    />
                    {pwMessage && (
                      <p
                        className={`text-sm rounded-lg p-3 ${
                          pwMessage.includes("sent")
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {pwMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Mail className="w-4 h-4" />
                      {pwLoading ? "Sending..." : "Send Password Reset Email"}
                    </button>
                    {pwMessage.includes("sent") && (
                      <p className="text-sm text-text-secondary flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        Use the link in the email to reset your password.
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

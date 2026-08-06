"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, Bell, Settings, LogOut, ChevronRight } from "lucide-react";

export default function AccountDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/account");
    }
  }, [status, router]);

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
    { id: "orders", label: "My Orders", icon: Package, href: "/orders" },
    { id: "bookings", label: "Decor Bookings", icon: Package },
    { id: "addresses", label: "Saved Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ];

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
                  if (item.href) {
                    return (
                      <Link key={item.id} href={item.href} className={classes}>
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    );
                  }
                  return (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`${classes} w-full text-left`}>
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
                <h2 className="text-xl font-luxury text-text-primary mb-6">My Orders</h2>
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
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <h2 className="text-xl font-luxury text-text-primary mb-6">Decor Bookings</h2>
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto text-border-custom mb-4" />
                  <p className="text-text-secondary mb-4">No event decor bookings yet</p>
                  <Link
                    href="/decor"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
                  >
                    Browse Decor Services
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-luxury text-text-primary">Saved Addresses</h2>
                  <button className="px-4 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition">
                    Add Address
                  </button>
                </div>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 mx-auto text-border-custom mb-4" />
                  <p className="text-text-secondary">No saved addresses</p>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <h2 className="text-xl font-luxury text-text-primary mb-6">My Wishlist</h2>
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
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-bg-card rounded-lg border border-border-custom p-6">
                <h2 className="text-xl font-luxury text-text-primary mb-6">Notifications</h2>
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-border-custom mb-4" />
                  <p className="text-text-secondary">No notifications</p>
                </div>
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
                  <button className="px-6 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Gift,
  Users,
  Truck,
  Calendar,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  DollarSign,
  MapPin,
  Home,
  Eye,
  Star,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/gift-types", label: "Gift Events", icon: Gift },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/delivery-zones", label: "Delivery Zones", icon: MapPin },
  { href: "/admin/event-types", label: "Event Types", icon: Calendar },
  { href: "/admin/decor-categories", label: "Decor Categories", icon: Package },
  { href: "/admin/decor-packages", label: "Decor Packages", icon: Package },
  { href: "/admin/decor-bookings", label: "Decor Bookings", icon: Calendar },
  { href: "/admin/riders", label: "Riders", icon: Truck },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-bg-card border-r border-border-custom transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-border-custom">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-primary flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <span className="font-luxury text-xl text-gold-primary">Admin</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg"
            >
              <X className="w-5 h-5 text-text-primary" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-gold-primary/10 text-gold-primary font-medium"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="p-4 border-t border-border-custom">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gold-primary/10 text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
            >
              <Home className="w-5 h-5" />
              View Website
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 bg-bg-card border-b border-border-custom flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg"
            >
              <Menu className="w-6 h-6 text-text-primary" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg w-96">
              <Search className="w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-secondary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 hover:bg-bg-secondary rounded-lg transition">
              <Bell className="w-6 h-6 text-text-primary" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-bg-secondary rounded-lg transition"
              >
                <div className="w-8 h-8 rounded-full bg-gold-primary/20 flex items-center justify-center">
                  <span className="text-gold-primary font-medium">
                    {session?.user?.name?.[0] || "A"}
                  </span>
                </div>
                <span className="hidden md:block text-text-primary font-medium">
                  {session?.user?.name || "Admin"}
                </span>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-border-custom rounded-lg shadow-lg z-20">
                    <div className="p-4 border-b border-border-custom">
                      <p className="font-medium text-text-primary">{session?.user?.name}</p>
                      <p className="text-sm text-text-secondary">{session?.user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2 text-text-primary hover:bg-bg-secondary rounded-lg transition"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

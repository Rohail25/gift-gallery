"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Gift,
  ChevronDown,
  LogOut,
  Package,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/CartProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop Gifts" },
  { href: "/decor", label: "Event Decor" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/orders", label: "My Orders" },
];

type Suggestion = {
  id: number;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number | null;
  images: Array<{ image_url: string }>;
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    const t = setTimeout(() => {
      setMobileOpen(false);
      setSearchOpen(false);
      setProfileOpen(false);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced live search suggestions
  useEffect(() => {
    if (!searchOpen) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length < 2) {
        if (!cancelled) setSuggestions([]);
        return;
      }

      setSearching(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        if (!cancelled) setSuggestions(data.data || []);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSuggestions([]);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-footer-bg text-footer-text text-center text-xs sm:text-sm py-2 px-4 tracking-wide">
        Free delivery on orders above Rs. 5,000 — nationwide Pakistan
      </div>

      <div className="bg-bg-card/95 backdrop-blur border-b border-border-custom">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 -ml-2 text-text-primary hover:text-gold-primary transition"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex w-9 h-9 rounded-full bg-gold-primary items-center justify-center">
              <Gift size={18} className="text-white" />
            </span>
            <span className="text-2xl sm:text-3xl font-luxury text-gold-primary leading-none">
              Gift Gallery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-text-primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-1 text-sm font-medium tracking-wide uppercase transition",
                  "hover:text-gold-primary after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-gold-primary after:transition-all after:duration-300",
                  isActive(link.href)
                    ? "text-gold-primary after:w-full"
                    : "after:w-0 hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 text-text-primary">
            <div ref={searchBoxRef} className="relative hidden sm:block">
              <button
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
                className="p-2 hover:text-gold-primary transition"
              >
                <Search size={20} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 w-[320px] sm:w-[400px] bg-bg-card border border-border-custom rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
                  <form onSubmit={submitSearch} className="flex items-center gap-2 px-4 py-3 border-b border-border-custom">
                    <Search size={18} className="text-text-secondary shrink-0" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search luxury gifts..."
                      className="flex-1 bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="text-sm font-medium text-gold-primary hover:text-gold-dark transition"
                    >
                      Search
                    </button>
                  </form>
                  <div className="max-h-80 overflow-y-auto">
                    {searching && (
                      <p className="px-4 py-3 text-sm text-text-secondary">Searching...</p>
                    )}
                    {!searching && suggestions.length === 0 && searchQuery.trim().length >= 2 && (
                      <p className="px-4 py-3 text-sm text-text-secondary">No products found</p>
                    )}
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSuggestions([]);
                        }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary transition"
                      >
                        <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-bg-secondary shrink-0">
                          {product.images[0] && (
                            <Image
                              src={product.images[0].image_url}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-text-primary truncate">{product.name}</span>
                          <span className="text-xs text-gold-primary font-medium">
                            Rs. {Math.round(product.sale_price ?? product.regular_price).toLocaleString()}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/favourites"
              aria-label="Favourites"
              className="p-2 hover:text-gold-primary transition"
            >
              <Heart size={20} />
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className="p-2 hover:text-gold-primary transition relative"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-gold text-white text-[10px] font-semibold min-w-[18px] px-0.5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Account"
                className="p-2 hover:text-gold-primary transition flex items-center"
              >
                <User size={20} />
                <ChevronDown size={14} className="hidden sm:block ml-0.5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-bg-card border border-border-custom rounded-2xl shadow-2xl shadow-black/10 overflow-hidden">
                  {status === "authenticated" && session?.user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border-custom bg-bg-secondary/50">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {session.user.name}
                        </p>
                        <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link
                          href="/account"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-secondary hover:text-gold-primary transition"
                        >
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-secondary hover:text-gold-primary transition"
                        >
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        {session.user.role !== "CUSTOMER" && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-primary hover:bg-bg-secondary hover:text-gold-primary transition"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-gold hover:bg-red-50 transition w-full text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-1.5">
                      <Link
                        href="/auth/login"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium bg-gold-primary text-white hover:bg-gold-dark transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gold-primary border border-gold-primary hover:bg-gold-primary hover:text-white transition"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="lg:hidden px-4 pb-3">
          <form onSubmit={submitSearch} className="flex items-center gap-2 bg-bg-secondary border border-border-custom rounded-full px-4 py-2">
            <Search size={16} className="text-text-secondary shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search luxury gifts..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
            <button type="submit" className="text-sm font-medium text-gold-primary shrink-0">
              Go
            </button>
          </form>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border-custom bg-bg-card">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-3 rounded-lg text-sm font-medium tracking-wide uppercase transition",
                    isActive(link.href)
                      ? "bg-bg-secondary text-gold-primary"
                      : "text-text-primary hover:bg-bg-secondary hover:text-gold-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

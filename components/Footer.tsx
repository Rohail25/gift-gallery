import Link from "next/link";
import { Gift } from "lucide-react";
import { FooterSettings } from "@/components/FooterSettings";

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "FAQ", href: "/contact" },
];

const CUSTOMER_SUPPORT = [
  { label: "My Orders", href: "/orders" },
  { label: "My Account", href: "/account" },
  { label: "Delivery Information", href: "/terms" },
  { label: "Refund Policy", href: "/privacy-policy" },
  { label: "Gift Guide", href: "/shop" },
];

const SHOP_LINKS = [
  { label: "Wedding Gifts", href: "/shop?giftType=wedding-gifts" },
  { label: "Birthday Gifts", href: "/shop?giftType=birthday-gifts" },
  { label: "Umrah Gifts", href: "/shop?giftType=umrah-gifts" },
  { label: "Anniversary Gifts", href: "/shop?giftType=anniversary-gifts" },
  { label: "Corporate Gifts", href: "/shop?giftType=corporate-gifts" },
];

export function Footer() {
  return (
    <footer className="bg-footer-bg text-footer-text">
      <div className="container mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex w-9 h-9 rounded-full bg-gold-primary items-center justify-center">
              <Gift size={18} className="text-white" />
            </span>
            <span className="text-2xl font-luxury text-gold-primary">
              Gift Gallery
            </span>
          </div>
          <p className="text-sm opacity-80 leading-relaxed mb-6">
            A luxury boutique for curated gifts and bespoke event decoration.
            Making every moment unforgettable since day one.
          </p>
          <FooterSettings />
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-luxury text-gold-light mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="opacity-80 hover:opacity-100 hover:text-gold-light transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-luxury text-gold-light mb-5">Customer Support</h4>
          <ul className="space-y-3 text-sm">
            {CUSTOMER_SUPPORT.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="opacity-80 hover:opacity-100 hover:text-gold-light transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-luxury text-gold-light mb-5">Shop</h4>
          <ul className="space-y-3 text-sm">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="opacity-80 hover:opacity-100 hover:text-gold-light transition">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-70">
          <p>&copy; {new Date().getFullYear()} Gift Gallery. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-gold-light transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-light transition">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

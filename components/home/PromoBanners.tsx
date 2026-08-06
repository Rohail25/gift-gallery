import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const BANNERS = [
  {
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Seasonal Offer",
    title: "Festive Gifting Edit",
    text: "Exclusive gift sets for Eid, Ramadan & more",
    cta: { label: "Shop Offers", href: "/shop" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
    eyebrow: "Wedding Season",
    title: "Bespoke Event Decor",
    text: "Book your dream decor with our expert team",
    cta: { label: "Book Now", href: "/book" },
  },
];

export function PromoBanners() {
  return (
    <section className="py-14 md:py-20 bg-bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {BANNERS.map((banner, i) => (
            <Link
              key={i}
              href={banner.cta.href}
              className="group relative overflow-hidden rounded-3xl border border-border-custom min-h-[280px]"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 text-white">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-light mb-2">
                  {banner.eyebrow}
                </p>
                <h3 className="text-2xl sm:text-3xl font-luxury">{banner.title}</h3>
                <p className="text-white/85 mt-2 max-w-sm">{banner.text}</p>
                <span className="inline-flex items-center gap-2 mt-4 text-sm font-medium uppercase tracking-wide text-gold-light group-hover:gap-3 transition-all">
                  {banner.cta.label}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

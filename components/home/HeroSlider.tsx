"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Curated Luxury Gifts",
    title: "Gifts for Life's Most Precious Moments",
    highlight: "Discover",
    text: "Hand-picked premium gifts and bespoke event decoration for weddings, birthdays, umrah and every celebration in between.",
    cta: { label: "Shop Now", href: "/shop" },
    cta2: { label: "Explore Decor", href: "/decor" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Bespoke Event Decor",
    title: "Weddings & Celebrations Styled to Perfection",
    highlight: "Impress",
    text: "From intimate gatherings to grand weddings — our decor team designs unforgettable experiences for every occasion.",
    cta: { label: "Book Decor", href: "/book" },
    cta2: { label: "View Packages", href: "/decor" },
  },
  {
    image:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1920&q=80",
    eyebrow: "Same-Day Delivery",
    title: "Premium Gifts Delivered Across Pakistan",
    highlight: "Delight",
    text: "Beautifully wrapped, thoughtfully curated, and delivered right on time — because every moment matters.",
    cta: { label: "Browse Collection", href: "/shop" },
    cta2: { label: "Our Services", href: "/about" },
  },
];

export function HeroSlider() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length),
    []
  );

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[70vh] min-h-[520px] max-h-[720px] overflow-hidden bg-footer-bg">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
          aria-hidden={i !== index}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20"></div>

          <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div
              className={cn(
                "max-w-2xl text-white transition-all duration-700",
                i === index ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              )}
            >
              <p className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gold-light mb-4">
                <span className="w-8 h-px bg-gold-light inline-block"></span>
                {slide.eyebrow}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-luxury leading-[1.1]">
                {slide.highlight}{" "}
                <span className="italic text-gold-light block">{slide.title.split(" ").slice(1).join(" ")}</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-white/85 max-w-lg leading-relaxed">
                {slide.text}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={slide.cta.href}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium rounded-full bg-gold-primary hover:bg-gold-dark transition shadow-lg shadow-gold-primary/30"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {slide.cta.label}
                </Link>
                <Link
                  href={slide.cta2.href}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium rounded-full border-2 border-white/70 text-white hover:bg-white hover:text-text-primary transition"
                >
                  {slide.cta2.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur text-white hover:bg-gold-primary transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur text-white hover:bg-gold-primary transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === index ? "w-8 bg-gold-primary" : "w-2 bg-white/50 hover:bg-white"
            )}
          />
        ))}
      </div>
    </section>
  );
}

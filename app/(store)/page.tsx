"use client";

import { useEffect, useState } from "react";
import { HeroSlider } from "@/components/home/HeroSlider";
import { GiftEventsSection, GiftEvent } from "@/components/home/GiftEventsSection";
import { CategoriesSection, CategoryItem } from "@/components/home/CategoriesSection";
import { PromoBanners } from "@/components/home/PromoBanners";
import { ProductSection } from "@/components/ProductSection";
import { DecorHighlights } from "@/components/home/DecorHighlights";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Testimonials } from "@/components/home/Testimonials";
import { GallerySection } from "@/components/home/GallerySection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ContactCTA } from "@/components/home/ContactCTA";

export default function HomePage() {
  const [giftTypes, setGiftTypes] = useState<GiftEvent[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [typesRes, categoriesRes] = await Promise.all([
          fetch("/api/gift-types?visibility=public"),
          fetch("/api/product-categories?visibility=public"),
        ]);

        const typesData = await typesRes.json();
        const categoriesData = await categoriesRes.json();

        if (!cancelled) {
          setGiftTypes(typesData.data || []);
          setCategories(categoriesData.data || []);
        }
      } catch {
        /* sections degrade gracefully */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-bg-primary">
      {/* 1. Hero Banner / Slider */}
      <HeroSlider />

      {/* 2. Shop by Gift Events */}
      <GiftEventsSection events={giftTypes} />

      {/* 3. Shop by Categories */}
      <CategoriesSection categories={categories} />

      {/* 4. Latest Products */}
      <ProductSection
        eyebrow="Fresh From The Studio"
        title="Latest Products"
        subtitle="The newest additions to our luxury collection"
        params={{ sort: "newest", limit: "8" }}
        badge="new"
        bg="bg-bg-primary"
      />

      {/* Seasonal / promotional banners */}
      <PromoBanners />

      {/* 5. Best Selling Products */}
      <ProductSection
        eyebrow="Customer Favorites"
        title="Best Selling Products"
        subtitle="The gifts everyone is loving right now"
        params={{ sort: "best-selling", limit: "8" }}
        badge="best-seller"
        bg="bg-bg-secondary"
      />

      {/* 6. Featured Products */}
      <ProductSection
        eyebrow="Handpicked For You"
        title="Featured Products"
        subtitle="Our team's personal favourites, curated with care"
        params={{ featured: "true", limit: "8" }}
        badge="featured"
        bg="bg-bg-primary"
      />

      {/* 7. New Arrivals */}
      <ProductSection
        eyebrow="Just Landed"
        title="New Arrivals"
        subtitle="Be the first to discover what's new in store"
        params={{ sort: "newest", limit: "8" }}
        badge="new"
        bg="bg-bg-secondary"
      />

      {/* 8. Popular Products */}
      <ProductSection
        eyebrow="Most Reviewed"
        title="Popular Products"
        subtitle="Loved and reviewed by customers across the country"
        params={{ sort: "popular", limit: "8" }}
        bg="bg-bg-primary"
      />

      {/* 9. Recommended Products */}
      <ProductSection
        eyebrow="Tailored Picks"
        title="Recommended For You"
        subtitle="Highly-rated gifts our experts recommend"
        params={{ sort: "recommended", limit: "8" }}
        bg="bg-bg-secondary"
      />

      {/* 10. Event Decor Highlights */}
      <DecorHighlights />

      {/* 11. Why Choose Us */}
      <WhyChooseUs />

      {/* 12. Customer Testimonials */}
      <Testimonials />

      {/* 13. Gallery Section */}
      <GallerySection />

      {/* 14. Newsletter Subscription */}
      <NewsletterSection />

      {/* 15. Contact Call-to-Action */}
      <ContactCTA />
    </div>
  );
}

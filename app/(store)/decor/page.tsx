"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

interface EventType {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  image_url?: string;
  is_visible: boolean;
}

interface DecorPackage {
  id: number;
  name: string;
  slug: string;
  starting_price: number;
  average_rating: number;
  reviews_count: number;
  images: Array<{ image_url: string; is_primary: boolean }>;
  decor_category?: {
    slug: string;
    event_type?: { slug: string } | null;
  } | null;
}

export default function DecorPage() {
  return (
    <Suspense fallback={null}>
      <DecorContent />
    </Suspense>
  );
}

function DecorContent() {
  const searchParams = useSearchParams();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [packages, setPackages] = useState<DecorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prevParams, setPrevParams] = useState(() => searchParams.toString());

  // Sync filter state from URL search params when they change
  if (prevParams !== searchParams.toString()) {
    setPrevParams(searchParams.toString());
    const eventType = searchParams.get("eventType");
    const category = searchParams.get("category");
    if (eventType) setSelectedEventType(eventType);
    if (category) setSelectedCategory(category);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, packagesRes] = await Promise.all([
          fetch("/api/event-types?visibility=public"),
          fetch("/api/decor-packages"),
        ]);

        const typesData = await typesRes.json();
        const packagesData = await packagesRes.json();

        setEventTypes(typesData.data || []);
        setPackages(packagesData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    if (selectedEventType) {
      const eventSlug = pkg.decor_category?.event_type?.slug;
      if (eventSlug !== selectedEventType) return false;
    }
    if (selectedCategory) {
      if (pkg.decor_category?.slug !== selectedCategory) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-gold/10 via-bg-secondary to-gold-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Bespoke Event Styling
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary mb-4">
            Event <span className="text-gold-primary italic">Decoration</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
            Transform your special occasions into unforgettable memories with our premium decoration services
          </p>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-12 bg-bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-luxury text-text-primary mb-6 text-center">
            Choose Your <span className="text-gold-primary">Event Type</span>
          </h2>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-32 h-11 bg-bg-card rounded-full animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
              <button
                onClick={() => setSelectedEventType(null)}
                className={`px-6 py-2.5 rounded-full border-2 transition whitespace-nowrap flex-shrink-0 ${
                  !selectedEventType
                    ? "bg-gold-primary text-white border-gold-primary"
                    : "border-border-custom text-text-primary hover:border-gold-primary"
                }`}
              >
                All Events
              </button>
              {eventTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedEventType(type.slug)}
                  className={`px-6 py-2.5 rounded-full border-2 transition whitespace-nowrap flex-shrink-0 ${
                    selectedEventType === type.slug
                      ? "bg-gold-primary text-white border-gold-primary"
                      : "border-border-custom text-text-primary hover:border-gold-primary"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-bg-card rounded-lg border border-border-custom animate-pulse">
                  <div className="aspect-video bg-bg-secondary rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-bg-secondary rounded w-3/4"></div>
                    <div className="h-4 bg-bg-secondary rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-text-secondary text-lg">No decoration packages available for this event type.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPackages.map((pkg) => (
                <Link key={pkg.id} href={`/decor/${pkg.slug}`} className="group">
                  <div className="bg-bg-card rounded-xl border border-border-custom overflow-hidden hover-premium-card h-full flex flex-col">
                    {/* Package Image */}
                    <div className="relative aspect-video bg-bg-secondary overflow-hidden">
                      {pkg.images[0] ? (
                        <Image
                          src={pkg.images[0].image_url}
                          alt={pkg.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-gold-primary font-luxury text-2xl">Gift Gallery</span>
                        </div>
                      )}
                    </div>

                    {/* Package Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-luxury text-xl text-text-primary group-hover:text-gold-primary transition mb-2">
                          {pkg.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(pkg.average_rating)
                                    ? "fill-gold-primary text-gold-primary"
                                    : "text-border-custom"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-text-secondary">
                            ({pkg.reviews_count} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-4 border-t border-border-custom">
                        <p className="text-sm text-text-secondary mb-1">Starting from</p>
                        <p className="text-2xl font-luxury text-gold-primary">
                          Rs. {Math.round(pkg.starting_price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-luxury text-text-primary mb-4">
            Plan Your Dream Event
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our team specializes in creating custom decorations for all occasions.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
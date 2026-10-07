"use client";

import { useEffect, useState } from "react";
import { GiftEventsSection, GiftEvent } from "@/components/home/GiftEventsSection";

export function GiftEventsPage() {
  const [events, setEvents] = useState<GiftEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/gift-types?visibility=public");
        const data = await res.json();
        if (!cancelled) setEvents(data.data || []);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-bg-primary">
      <div className="bg-bg-secondary border-b border-border-custom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Curated Occasions
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary">
            Gift <span className="text-gold-primary italic">Events</span>
          </h1>
          <p className="text-text-secondary mt-3 max-w-2xl mx-auto">
            Browse our full collection organized by the special moments you love most
          </p>
        </div>
      </div>

      <div className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse p-5 rounded-2xl bg-bg-card border border-border-custom">
                  <div className="aspect-square rounded-xl bg-bg-secondary"></div>
                  <div className="h-5 bg-bg-secondary rounded mt-4 w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <GiftEventsSection events={events} />
          )}
        </div>
      </div>
    </div>
  );
}

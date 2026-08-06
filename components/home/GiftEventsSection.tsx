import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export type GiftEvent = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
};

export function GiftEventsSection({
  events,
  limit,
}: {
  events: GiftEvent[];
  limit?: number;
}) {
  if (events.length === 0) return null;

  const visible = typeof limit === "number" ? events.slice(0, limit) : events;

  return (
    <section className="py-14 md:py-20 bg-bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
              Curated Occasions
            </p>
            <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
              Shop by <span className="text-gold-primary italic">Gift Events</span>
            </h2>
            <p className="text-text-secondary mt-2 max-w-2xl">
              Browse our collection organized by the special moments you love most
            </p>
          </div>
          <Link
            href="/gift-events"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-gold-primary hover:text-gold-dark transition group shrink-0"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {visible.map((type) => (
            <Link
              key={type.id}
              href={`/shop?giftType=${type.slug}`}
              className="group p-5 rounded-2xl bg-bg-card border border-border-custom hover:border-gold-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-primary/10 transition-all duration-300"
            >
              <div className="text-center space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-primary">
                  {type.image_url ? (
                    <Image
                      src={type.image_url}
                      alt={type.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-primary/10 to-rose-gold/10">
                      <Sparkles className="w-10 h-10 text-gold-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-luxury text-lg text-text-primary group-hover:text-gold-primary transition">
                    {type.name}
                  </h3>
                  {type.description && (
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">
                      {type.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

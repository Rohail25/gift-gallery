import Image from "next/image";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-8 h-8"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

const GALLERY = [
  {
    image:
      "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80",
    alt: "Luxury gift box",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    alt: "Wedding decoration",
  },
  {
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
    alt: "Elegant gift wrapping",
  },
  {
    image:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    alt: "Fresh flower arrangement",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80",
    alt: "Event table styling",
  },
  {
    image:
      "https://images.unsplash.com/photo-1602874801006-d26c4f6a5f2f?auto=format&fit=crop&w=600&q=80",
    alt: "Candlelit celebration",
  },
];

export function GallerySection() {
  return (
    <section className="py-14 md:py-20 bg-bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Moments We Created
          </p>
          <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
            Our <span className="text-gold-primary italic">Gallery</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mt-3">
            A glimpse into the gifts and celebrations we have crafted with love
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY.map((item, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-bg-card border border-border-custom"
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                loading="lazy"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <InstagramIcon />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Quote, Star, BadgeCheck } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "The bouquet arrived perfectly wrapped and my wife absolutely adored it. The attention to detail was extraordinary — easily the most premium gift experience in the city.",
    name: "Ayesha Khan",
    title: "Anniversary Gift",
  },
  {
    quote:
      "From booking to setup, the decor team was flawless. Our wedding hall looked straight out of a magazine. Worth every rupee and more.",
    name: "Hamza & Fatima",
    title: "Wedding Decor",
  },
  {
    quote:
      "I was worried about same-day delivery but they exceeded expectations. Beautiful packaging, handwritten note included, and delivered right on time.",
    name: "Zainab Ali",
    title: "Corporate Gifting",
  },
];

export function Testimonials() {
  return (
    <section className="py-14 md:py-20 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            Why They Love Us
          </p>
          <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
            Customer <span className="text-gold-primary italic">Testimonials</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mt-3">
            Real stories from customers who trusted us with their most precious moments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, i) => (
            <div
              key={i}
              className="bg-bg-card rounded-2xl border border-border-custom p-8 hover:border-gold-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-primary/10 transition-all duration-300 flex flex-col"
            >
              <Quote className="w-8 h-8 text-gold-primary/40 mb-4" />
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-gold-primary text-gold-primary" />
                ))}
              </div>
              <p className="text-text-secondary leading-relaxed flex-1 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 pt-6 border-t border-border-custom flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gold-primary/10 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-gold-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{testimonial.name}</p>
                  <p className="text-sm text-text-secondary">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

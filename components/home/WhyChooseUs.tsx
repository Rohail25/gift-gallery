import { Sparkles, Truck, Headset, ShieldCheck, Gift, HeartHandshake } from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Curated Selection",
    text: "Hand-picked premium gifts from trusted brands, chosen for their quality and charm.",
  },
  {
    icon: Truck,
    title: "Fast Nationwide Delivery",
    text: "Same-day and next-day delivery across 50+ cities in Pakistan, fully tracked.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    text: "Our dedicated team is always here to help with orders, gifts and events.",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    text: "Every product is guaranteed genuine with secure payment and easy returns.",
  },
  {
    icon: Gift,
    title: "Beautiful Gift Wrapping",
    text: "Complimentary premium wrapping with handwritten notes on every order.",
  },
  {
    icon: HeartHandshake,
    title: "Bespoke Event Decor",
    text: "Award-winning decoration team bringing your dream celebrations to life.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-14 md:py-20 bg-bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
            The Gift Gallery Difference
          </p>
          <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
            Why Choose <span className="text-gold-primary italic">Us</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mt-3">
            We go beyond selling gifts — we craft experiences that leave lasting memories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-bg-card rounded-2xl border border-border-custom p-7 hover:border-gold-primary hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-primary/10 transition-all duration-300"
            >
              <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-gold-primary/15 to-rose-gold/15 flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-gold-primary" />
              </div>
              <h3 className="text-lg font-luxury text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

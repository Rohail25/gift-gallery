import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Gift, Sparkles, Heart, Gem, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | GiftGallery",
  description:
    "The story behind Gift Gallery — Pakistan's destination for luxury gifts and bespoke event decor for weddings, birthdays, umrah and every celebration.",
};

const VALUES = [
  {
    icon: Gem,
    title: "Curated Luxury",
    text: "Every product in our collection is hand-picked for its craftsmanship, quality, and the joy it brings to the recipient.",
  },
  {
    icon: Sparkles,
    title: "Bespoke Decor",
    text: "From intimate anniversaries to grand weddings, our decor studio transforms venues into unforgettable experiences.",
  },
  {
    icon: Heart,
    title: "Thoughtful Service",
    text: "Personalised gift wrapping, timely delivery, and a team that treats every order as if it were their own.",
  },
];

const STATS = [
  { value: "5K+", label: "Happy Customers" },
  { value: "300+", label: "Curated Gifts" },
  { value: "50+", label: "Decor Events" },
  { value: "4.9/5", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-gold-primary mb-3">
              About Us
            </p>
            <h1 className="text-4xl md:text-5xl font-luxury text-text-primary mb-6">
              The Story Behind <span className="text-gold-primary italic">Gift Gallery</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              We believe every gift should feel as special as the person receiving it. Gift Gallery
              was born from a simple idea — to make gifting effortless, elegant, and unforgettable.
            </p>
          </div>

          <div className="bg-bg-card rounded-3xl border border-border-custom p-8 md:p-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-luxury text-text-primary mb-5">
                  Gifting, Reimagined
                </h2>
                <div className="space-y-4 text-text-secondary leading-relaxed">
                  <p>
                    What started as a small passion for celebrating life&apos;s milestones has grown
                    into Pakistan&apos;s premier destination for luxury gifts and event decor. From
                    handcrafted{" "}
                    <Link href="/shop?giftType=wedding-gifts" className="text-gold-primary hover:text-gold-dark">
                      wedding keepsakes
                    </Link>{" "}
                    to elegant{" "}
                    <Link href="/shop?giftType=umrah-gifts" className="text-gold-primary hover:text-gold-dark">
                      Umrah gifts
                    </Link>{" "}
                    and heartfelt birthday surprises, every item carries our promise of quality.
                  </p>
                  <p>
                    Alongside our boutique collection, our{" "}
                    <Link href="/decor" className="text-gold-primary hover:text-gold-dark">
                      decor studio
                    </Link>{" "}
                    designs breathtaking themes — soft romantic pastels, opulent gold, and seasonal
                    enchantment — so your celebrations look as beautiful as they feel.
                  </p>
                  <p>
                    We&apos;re proud to be part of thousands of love stories, one gift at a time.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center px-7 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition"
                  >
                    Explore the Collection
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-7 py-3 border border-gold-primary text-gold-primary font-medium rounded-full hover:bg-gold-primary hover:text-white transition"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4]">
                  <Image
                    src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=800&auto=format&fit=crop"
                    alt="Luxury gift wrapping"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mt-8">
                  <Image
                    src="https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=800&auto=format&fit=crop"
                    alt="Event decor"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg-card py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-luxury text-gold-primary mb-2">{stat.value}</p>
                <p className="text-sm text-text-secondary uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bg-primary py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-medium tracking-[0.25em] uppercase text-gold-primary mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
              The Gift Gallery <span className="text-gold-primary italic">Promise</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-bg-card rounded-3xl border border-border-custom p-8 text-center hover:border-gold-primary hover:shadow-lg hover:shadow-gold-primary/10 transition-all"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-primary/10 mb-5">
                  <value.icon className="w-8 h-8 text-gold-primary" />
                </span>
                <h3 className="text-xl font-luxury text-text-primary mb-3">{value.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary via-bg-card to-bg-primary py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Star className="w-10 h-10 text-gold-primary mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-luxury text-text-primary mb-4">
            Let&apos;s Celebrate Together
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Whether it&apos;s a milestone anniversary or a new beginning, we&apos;d love to be part
            of your story.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition"
          >
            <Gift className="w-5 h-5" />
            Start Planning Your Gift
          </Link>
        </div>
      </section>
    </>
  );
}

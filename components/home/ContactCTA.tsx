import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";

export function ContactCTA() {
  return (
    <section className="py-14 md:py-20 bg-bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-footer-bg rounded-3xl p-10 md:p-14 text-white border border-gold-primary/20">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold-primary/15 blur-3xl"></div>
          <div className="relative text-center">
            <h2 className="text-3xl md:text-4xl font-luxury mb-4">
              Need Help Choosing the <span className="text-gold-light italic">Perfect Gift?</span>
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Our gifting experts are ready to help you find something truly special.
              Reach out today — we would love to assist.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition shadow-lg shadow-gold-primary/20"
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white/60 text-white font-medium rounded-full hover:bg-white hover:text-text-primary transition"
              >
                Browse Gifts
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-sm">
              <p className="flex items-center justify-center gap-2 opacity-85">
                <Phone className="w-4 h-4 text-gold-light" /> +92 300 0000000
              </p>
              <p className="flex items-center justify-center gap-2 opacity-85">
                <Mail className="w-4 h-4 text-gold-light" /> hello@giftgallery.pk
              </p>
              <p className="flex items-center justify-center gap-2 opacity-85">
                <MapPin className="w-4 h-4 text-gold-light" /> Karachi, Pakistan
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

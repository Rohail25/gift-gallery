"use client";

import { useState } from "react";
import { Mail, Check } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <section className="py-14 md:py-20 bg-bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border-custom bg-gradient-to-r from-gold-primary/10 via-rose-gold/10 to-gold-primary/10 p-8 md:p-14">
          <div className="absolute -top-16 right-0 w-64 h-64 rounded-full bg-gold-primary/10 blur-3xl"></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-3">
                Stay in the Loop
              </p>
              <h2 className="text-3xl md:text-4xl font-luxury text-text-primary">
                Subscribe to our <span className="text-gold-primary italic">Newsletter</span>
              </h2>
              <p className="text-text-secondary mt-3 max-w-md">
                Get exclusive offers, new arrivals and gifting ideas delivered straight to your inbox.
              </p>
            </div>

            <div>
              {done ? (
                <div className="bg-bg-card rounded-2xl border border-border-custom p-6 flex items-center gap-4">
                  <span className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Check className="w-6 h-6 text-green-600" />
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">Thank you for subscribing!</p>
                    <p className="text-sm text-text-secondary mt-1">
                      Watch your inbox for exclusive offers and updates.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-bg-card rounded-2xl border border-border-custom p-3 flex flex-col sm:flex-row gap-3 shadow-lg shadow-gold-primary/5"
                >
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <Mail className="w-5 h-5 text-text-secondary shrink-0" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-transparent text-text-primary placeholder:text-text-secondary focus:outline-none py-2"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gold-primary text-white font-medium hover:bg-gold-dark transition shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

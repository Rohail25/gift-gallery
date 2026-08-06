"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";

interface Settings {
  [key: string]: string | null;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!cancelled) setSettings(data.data || {});
      } catch {
        if (!cancelled) setSettings({});
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const contactInfo = [
    { icon: MapPin, label: "Visit Us", value: settings.address || "Add address in admin settings" },
    { icon: Phone, label: "Call Us", value: settings.phone || "Add phone in admin settings" },
    { icon: Mail, label: "Email Us", value: settings.email || "Add email in admin settings" },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon – Sat: 10:00 AM – 9:00 PM",
    },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="bg-bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-gold-primary mb-3">
            Contact Us
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary mb-6">
            We&apos;d Love to <span className="text-gold-primary italic">Hear From You</span>
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Questions about an order, planning a grand event, or need gift advice? Our team is here
            to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-4">
            {contactInfo.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 bg-bg-card rounded-2xl border border-border-custom p-5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-primary/10">
                  <item.icon className="w-6 h-6 text-gold-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-gold-primary mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-text-primary break-words">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-3 bg-bg-card rounded-3xl border border-border-custom p-8 md:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <CheckCircle2 className="w-16 h-16 text-gold-primary mb-5" />
                <h2 className="text-2xl font-luxury text-text-primary mb-2">Message Sent</h2>
                <p className="text-text-secondary mb-8 max-w-sm">
                  Thank you, {form.name || "friend"}! We&apos;ve received your message and will get
                  back to you within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="px-6 py-2.5 border border-gold-primary text-gold-primary font-medium rounded-full hover:bg-gold-primary hover:text-white transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-luxury text-text-primary">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Your Name</label>
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 bg-bg-primary border border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Your Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 bg-bg-primary border border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    className="w-full px-4 py-3 bg-bg-primary border border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Message</label>
                  <textarea
                    required
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us more..."
                    className="w-full px-4 py-3 bg-bg-primary border border-border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-gold-primary resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-gold-primary text-white font-medium rounded-full hover:bg-gold-dark transition"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

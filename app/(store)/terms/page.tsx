import type { Metadata } from "next";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | GiftGallery",
  description:
    "The terms and conditions that govern your use of the Gift Gallery website, orders, payments, delivery, returns, and decor bookings.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Gift Gallery website and services, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our services.",
  },
  {
    title: "2. Use of the Website",
    body: "You must be at least 18 years old to make a purchase. You agree to provide accurate, current, and complete information when creating an account or placing an order, and to maintain the confidentiality of your account credentials.",
  },
  {
    title: "3. Products & Pricing",
    body: "We strive to display our products and prices accurately. Prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices and product availability at any time without prior notice.",
  },
  {
    title: "4. Orders & Acceptance",
    body: "Once you place an order, we will send a confirmation with your order number. An order is only accepted once we confirm it and (where applicable) receive payment. We reserve the right to refuse or cancel an order, in which case any paid amount will be refunded.",
  },
  {
    title: "5. Payment",
    body: "We accept the payment methods displayed at checkout. All transactions are processed securely. By completing a purchase you authorise us (or our payment provider) to charge the stated amount to your chosen payment method.",
  },
  {
    title: "6. Delivery & Tracking",
    body: "Delivery timelines are estimates and may vary based on your location. Once your order is dispatched, you will receive tracking details. Please ensure your delivery address is correct, as changes after dispatch may incur additional charges.",
  },
  {
    title: "7. Returns & Refunds",
    body: "We want you to love every gift. If an item arrives damaged, defective, or not as described, contact us within 7 days of delivery with your order number and photos. Refunds are processed to your original payment method within 5–7 working days of approval.",
  },
  {
    title: "8. Gift Wrapping & Personalisation",
    body: "Gifts may include our signature wrapping. Personalised items are made to order and may not be eligible for return unless defective. Please double-check any personalised details (names, dates, messages) at checkout.",
  },
  {
    title: "9. Decor Bookings",
    body: "Event decor bookings require a deposit to confirm your date. Rescheduling is subject to availability and at least 7 days notice. Final themes and arrangements are confirmed in writing before your event.",
  },
  {
    title: "10. Intellectual Property",
    body: "All content on this website — including logos, text, graphics, and product imagery — is the property of Gift Gallery and may not be copied or reused without our written permission.",
  },
  {
    title: "11. Limitation of Liability",
    body: "To the maximum extent permitted by law, Gift Gallery shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services. Our total liability for any claim is limited to the amount you paid for the relevant order.",
  },
  {
    title: "12. Changes to These Terms",
    body: "We may update these Terms & Conditions from time to time. Changes take effect when posted on this page. Continued use of our services after changes constitutes acceptance of the updated terms.",
  },
];

export default function TermsConditionsPage() {
  return (
    <div className="bg-bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-primary/10 mb-5">
            <ScrollText className="w-8 h-8 text-gold-primary" />
          </span>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-gold-primary mb-3">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary mb-4">
            Terms & <span className="text-gold-primary italic">Conditions</span>
          </h1>
          <p className="text-text-secondary">Last updated: August 2026</p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div
              key={section.title}
              className="bg-bg-card rounded-2xl border border-border-custom p-6 md:p-8"
            >
              <h2 className="text-lg font-luxury text-gold-primary mb-3">{section.title}</h2>
              <p className="text-sm text-text-secondary leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-bg-card rounded-2xl border border-gold-primary/40 p-6 md:p-8 text-center">
          <h2 className="text-xl font-luxury text-text-primary mb-2">Need Assistance?</h2>
          <p className="text-sm text-text-secondary">
            Our support team is happy to answer any questions about your orders.{" "}
            <a href="mailto:support@giftgallery.pk" className="text-gold-primary hover:underline">
              support@giftgallery.pk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

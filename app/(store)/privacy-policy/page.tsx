import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Gift Gallery",
  description:
    "How Gift Gallery collects, uses, and protects your personal information when you shop, sign in, or contact us.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly, such as your name, email address, phone number, delivery address, and order details when you create an account, place an order, or contact us. We also collect limited device and usage data to improve your shopping experience.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Your information is used to process and deliver orders, provide customer support, personalise your shopping experience, send order updates and (with your consent) promotions, and to improve our website and services. We never sell your personal information.",
  },
  {
    title: "3. Payment Security",
    body: "All payment information is processed through secure, PCI-compliant payment providers. We do not store full card details on our servers. When you sign in with Google, only your profile name and email address are shared with us.",
  },
  {
    title: "4. Cookies & Similar Technologies",
    body: "We use cookies to keep you signed in, remember your cart and preferences, and understand how visitors use our site. You can control cookies through your browser settings, though some features may not work without them.",
  },
  {
    title: "5. Data Sharing",
    body: "We share your data only with trusted partners who help us operate our business — such as delivery carriers and payment processors — and only to the extent needed to fulfil your order or request. We never share data with advertisers for their own use.",
  },
  {
    title: "6. Data Retention",
    body: "We retain your information only as long as necessary to fulfil the purposes described in this policy, comply with legal obligations, and resolve disputes. Order records are retained to honour warranties and facilitate returns.",
  },
  {
    title: "7. Your Rights",
    body: "You may access, correct, or request deletion of your personal information at any time by contacting us. You can also update your details from your account dashboard and unsubscribe from marketing communications with one click.",
  },
  {
    title: "8. Children's Privacy",
    body: "Our website is intended for users aged 18 and above. We do not knowingly collect personal information from children. If you believe a child has provided us with data, please contact us so we can remove it.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Any changes will be posted on this page with a revised effective date. Continued use of our services after changes constitute acceptance of the updated policy.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold-primary/10 mb-5">
            <ShieldCheck className="w-8 h-8 text-gold-primary" />
          </span>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-gold-primary mb-3">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary mb-4">
            Privacy <span className="text-gold-primary italic">Policy</span>
          </h1>
          <p className="text-text-secondary">Last updated: August 2026</p>
        </div>

        <p className="text-text-secondary leading-relaxed mb-10">
          At Gift Gallery, your privacy matters to us. This policy explains what information we
          collect, how we use it, and the choices you have. By using our website and services, you
          agree to the practices described below.
        </p>

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
          <h2 className="text-xl font-luxury text-text-primary mb-2">Questions About Privacy?</h2>
          <p className="text-sm text-text-secondary">
            Contact us and we&apos;ll be happy to help.{" "}
            <a href="mailto:support@giftgallery.pk" className="text-gold-primary hover:underline">
              support@giftgallery.pk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Gift Gallery",
  description:
    "Get in touch with Gift Gallery — questions about an order, gift advice, or planning a bespoke event decor. Our team is here to help.",
};

export default function ContactLayout({ children }: LayoutProps<"/contact">) {
  return children;
}

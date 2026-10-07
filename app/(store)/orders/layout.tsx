import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | GiftGallery",
  description:
    "Track and review your Gift Gallery orders — order status, items, delivery details and order summaries.",
};

export default function OrdersLayout({ children }: LayoutProps<"/orders">) {
  return children;
}

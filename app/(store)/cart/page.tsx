import type { Metadata } from "next";
import { CartPage } from "@/app/components/store/CartPageClient";

export const metadata: Metadata = {
  title: "Shopping Cart | GiftGallery",
  description:
    "Review the items in your Gift Gallery cart and proceed to secure checkout.",
};

export default function Page() {
  return <CartPage />;
}

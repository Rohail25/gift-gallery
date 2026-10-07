import type { Metadata } from "next";
import { CheckoutPage } from "@/app/components/store/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Checkout | GiftGallery",
  description:
    "Complete your Gift Gallery order — secure payment, delivery details and order summary.",
};

export default function Page() {
  return <CheckoutPage />;
}

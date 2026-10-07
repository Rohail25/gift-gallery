import type { Metadata } from "next";
import { ShopPage } from "@/app/components/store/ShopPageClient";

export const metadata: Metadata = {
  title: "Shop | GiftGallery",
  description:
    "Browse the Gift Gallery collection — luxury gifts curated by occasion, category, price and more. Premium quality with fast delivery.",
};

export default function Page() {
  return <ShopPage />;
}

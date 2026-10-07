import type { Metadata } from "next";
import { HomePage } from "@/app/components/store/HomePageClient";

export const metadata: Metadata = {
  title: "Gift Gallery — Luxury Gifts & Event Decor | GiftGallery",
  description:
    "Curated luxury gifts and bespoke event decoration for weddings, birthdays, umrah and every occasion in between.",
};

export default function Page() {
  return <HomePage />;
}

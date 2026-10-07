import type { Metadata } from "next";
import { DecorPage } from "@/app/components/store/DecorPageClient";

export const metadata: Metadata = {
  title: "Event Decor | GiftGallery",
  description:
    "Bespoke event decoration packages for weddings, birthdays, umrah and corporate events. Explore our decor collections and book your perfect celebration.",
};

export default function Page() {
  return <DecorPage />;
}

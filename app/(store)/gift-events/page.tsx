import type { Metadata } from "next";
import { GiftEventsPage } from "@/app/components/store/GiftEventsPageClient";

export const metadata: Metadata = {
  title: "Gift Events | GiftGallery",
  description:
    "Curated gifts for every occasion — weddings, birthdays, umrah, eid, anniversaries and more from Gift Gallery.",
};

export default function Page() {
  return <GiftEventsPage />;
}

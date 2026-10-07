import type { Metadata } from "next";
import { CategoriesPage } from "@/app/components/store/CategoriesPageClient";

export const metadata: Metadata = {
  title: "Categories  | GiftGallery",
  description:
    "Shop gifts by category — flowers, cakes, hampers, jewelry, electronics and more, curated by Gift Gallery.",
};

export default function Page() {
  return <CategoriesPage />;
}

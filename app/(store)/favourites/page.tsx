import type { Metadata } from "next";
import { FavouritesPage } from "@/app/components/store/FavouritesPageClient";

export const metadata: Metadata = {
  title: "My Favourites | GiftGallery",
  description:
    "Your saved gifts on Gift Gallery — view and quickly re-order the items you love.",
};

export default function Page() {
  return <FavouritesPage />;
}

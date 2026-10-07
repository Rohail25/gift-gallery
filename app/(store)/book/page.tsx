import type { Metadata } from "next";
import { BookDecorPage } from "@/app/components/store/BookDecorPageClient";

export const metadata: Metadata = {
  title: "Book Event Decor | GiftGallery",
  description:
    "Book your bespoke event decoration with Gift Gallery — wedding, birthday, umrah and more.",
};

export default function Page() {
  return <BookDecorPage />;
}

import type { Metadata } from "next";
import { RegisterPage } from "@/app/components/store/RegisterPageClient";

export const metadata: Metadata = {
  title: "Create Account | GiftGallery",
  description:
    "Create your Gift Gallery account to shop luxury gifts, save favourites and book event decor.",
};

export default function Page() {
  return <RegisterPage />;
}

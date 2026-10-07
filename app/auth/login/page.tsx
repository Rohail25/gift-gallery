import type { Metadata } from "next";
import { LoginPage } from "@/app/components/store/LoginPageClient";

export const metadata: Metadata = {
  title: "Login | GiftGallery",
  description:
    "Sign in to your Gift Gallery account to track orders, save favourites and manage bookings.",
};

export default function Page() {
  return <LoginPage />;
}

import type { Metadata } from "next";
import { AccountDashboardPage } from "@/app/components/store/AccountPageClient";

export const metadata: Metadata = {
  title: "My Account | GiftGallery",
  description:
    "Manage your Gift Gallery account — track orders, decor bookings, addresses, wishlist and notifications.",
};

export default function Page() {
  return <AccountDashboardPage />;
}

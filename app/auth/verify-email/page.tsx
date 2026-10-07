import type { Metadata } from "next";
import { VerifyEmailPage } from "@/app/components/store/VerifyEmailPageClient";

export const metadata: Metadata = {
  title: "Verify Email | GiftGallery",
  description:
    "Verify your email address to activate your Gift Gallery account.",
};

export default function Page() {
  return <VerifyEmailPage />;
}

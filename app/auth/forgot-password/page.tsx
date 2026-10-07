import type { Metadata } from "next";
import { ForgotPasswordPage } from "@/app/components/store/ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Forgot Password | GiftGallery",
  description:
    "Reset your Gift Gallery account password — we'll send you a secure reset link.",
};

export default function Page() {
  return <ForgotPasswordPage />;
}

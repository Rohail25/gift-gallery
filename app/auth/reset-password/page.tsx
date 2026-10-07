import type { Metadata } from "next";
import { ResetPasswordPage } from "@/app/components/store/ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password | GiftGallery",
  description:
    "Set a new password for your Gift Gallery account.",
};

export default function Page() {
  return <ResetPasswordPage />;
}

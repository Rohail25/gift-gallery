import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import RiderShell from "./rider-shell";

export const dynamic = "force-dynamic";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login?callbackUrl=/rider");
  }

  const role = (session.user.role || "").toUpperCase();
  if (role !== "RIDER") {
    redirect("/");
  }

  return <RiderShell>{children}</RiderShell>;
}

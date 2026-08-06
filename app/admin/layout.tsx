import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminShell from "./admin-shell";

const ADMIN_ROLES = ["ADMIN", "SHOP_MANAGER", "DECOR_MANAGER"];

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const role = (session.user.role || "").toUpperCase();
  if (!ADMIN_ROLES.includes(role)) {
    redirect("/");
  }

  return <AdminShell>{children}</AdminShell>;
}

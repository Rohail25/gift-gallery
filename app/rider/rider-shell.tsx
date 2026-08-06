"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Bike, LogOut, Store } from "lucide-react";

export default function RiderShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-30 bg-bg-card border-b border-border-custom">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/rider" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gold-primary flex items-center justify-center">
              <Bike className="w-5 h-5 text-white" />
            </div>
            <span className="font-luxury text-xl text-gold-primary">Rider</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-text-secondary mr-2">
              {session?.user?.name}
            </span>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg px-3 py-2 transition"
            >
              <Store className="w-4 h-4" />
              Website
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg px-3 py-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

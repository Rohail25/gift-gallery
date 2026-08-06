"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={`fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gold-primary text-white shadow-lg shadow-gold-primary/30 transition-all duration-500 hover:bg-gold-dark ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-16 opacity-0 pointer-events-none"
      }`}
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type AddToCartResult = { ok: boolean; error?: string };

type CartContextValue = {
  cartCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<AddToCartResult>;
};

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  refreshCart: async () => {},
  addToCart: async () => ({ ok: false }),
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const json = await res.json();
        setCartCount(json.data?.itemCount ?? 0);
      }
    } catch {
      /* ignore */
    }
  }, [status]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (status !== "authenticated") {
        await Promise.resolve();
        if (!cancelled) setCartCount(0);
        return;
      }
      try {
        const res = await fetch("/api/cart");
        const json = await res.json();
        if (!cancelled && res.ok) {
          setCartCount(json.data?.itemCount ?? 0);
        }
      } catch {
        /* ignore */
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  // Refresh the cart badge whenever a "cartUpdated" event fires
  // (e.g. after checkout or after the cart is cleared)
  useEffect(() => {
    function onCartUpdated() {
      refreshCart();
    }
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1): Promise<AddToCartResult> => {
      if (status !== "authenticated") {
        const callbackUrl = `${window.location.pathname}${window.location.search}`;
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return { ok: false };
      }
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await res.json();
        if (res.ok) {
          await refreshCart();
          return { ok: true };
        }
        return { ok: false, error: data.error || "Failed to add to cart" };
      } catch {
        return { ok: false, error: "An unexpected error occurred" };
      }
    },
    [status, router, refreshCart]
  );

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

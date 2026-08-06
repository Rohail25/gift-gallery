"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type WishlistContextValue = {
  ids: number[];
  count: number;
  isInWishlist: (productId: number) => boolean;
  toggle: (productId: number) => void;
  remove: (productId: number) => void;
};

const STORAGE_KEY = "gift-gallery-wishlist";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n) => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

function persistIds(ids: number[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

const WishlistContext = createContext<WishlistContextValue>({
  ids: [],
  count: 0,
  isInWishlist: () => false,
  toggle: () => {},
  remove: () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIds(readIds());
    }, 0);

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setIds(readIds());
    }

    window.addEventListener("storage", onStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = useCallback((productId: number) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      persistIds(next);
      return next;
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      persistIds(next);
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => ids.includes(productId),
    [ids]
  );

  return (
    <WishlistContext.Provider
      value={{
        ids,
        count: ids.length,
        isInWishlist,
        toggle,
        remove,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

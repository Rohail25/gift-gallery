// lib/hooks/useProducts.ts
"use client";

import { useState, useEffect } from "react";

export function useProducts(filters: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIt = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams(filters).toString();
        const res = await fetch(`/api/products?${query}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, [JSON.stringify(filters)]);

  return { data, loading };
}

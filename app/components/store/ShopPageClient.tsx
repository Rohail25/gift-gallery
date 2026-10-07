"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard, type ProductCardProduct } from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";

interface GiftType {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGiftType, setSelectedGiftType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [featured, setFeatured] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [prevParams, setPrevParams] = useState("");

  // Sync filter state from URL search params (applies on first load too)
  if (prevParams !== searchParams.toString()) {
    setPrevParams(searchParams.toString());
    setSelectedGiftType(searchParams.get("giftType"));
    setSelectedCategory(searchParams.get("category"));
    setSearch(searchParams.get("search") || "");
    setSort(searchParams.get("sort") || "newest");
    setFeatured(searchParams.get("featured") === "true");
    setPage(1);
  }

  // Fetch gift types and categories
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [typesRes, categoriesRes] = await Promise.all([
          fetch("/api/gift-types?visibility=public"),
          fetch("/api/product-categories?visibility=public"),
        ]);

        const typesData = await typesRes.json();
        const categoriesData = await categoriesRes.json();

        setGiftTypes(typesData.data || []);
        setCategories(categoriesData.data || []);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "12");

        if (search) params.append("search", search);
        if (selectedGiftType) params.append("giftType", selectedGiftType);
        if (selectedCategory) params.append("category", selectedCategory);
        if (featured) params.append("featured", "true");
        if (priceRange.min > 0) params.append("minPrice", priceRange.min.toString());
        if (priceRange.max < 100000) params.append("maxPrice", priceRange.max.toString());
        params.append("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();

        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, search, selectedGiftType, selectedCategory, featured, priceRange, sort]);

  const handleResetFilters = () => {
    setSelectedGiftType(null);
    setSelectedCategory(null);
    setFeatured(false);
    setPriceRange({ min: 0, max: 100000 });
    setSearch("");
    setSort("newest");
    setPage(1);
  };

  const handleAddToCart = async (product: ProductCardProduct) => {
    const result = await addToCart(product.id);
    if (!result.ok && result.error) {
      alert(result.error);
    }
  };

  const filters = (
    <div className="bg-bg-card rounded-2xl border border-border-custom p-6 space-y-6">
      <div>
        <h3 className="font-luxury text-text-primary mb-4">Search</h3>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products..."
          className="w-full px-4 py-2.5 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-bg-primary text-text-primary placeholder:text-text-secondary"
        />
      </div>

      <div>
        <h3 className="font-luxury text-text-primary mb-4">Gift Events</h3>
        <div className="space-y-2">
          {giftTypes.map((type) => (
            <label key={type.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="giftType"
                value={type.slug}
                checked={selectedGiftType === type.slug}
                onChange={(e) => {
                  setSelectedGiftType(e.target.value);
                  setPage(1);
                }}
                className="rounded border-border-custom text-gold-primary accent-gold-primary"
              />
              <span className="text-text-secondary hover:text-text-primary text-sm">
                {type.name}
              </span>
            </label>
          ))}
          {selectedGiftType && (
            <button
              onClick={() => {
                setSelectedGiftType(null);
                setPage(1);
              }}
              className="text-sm text-gold-primary hover:text-gold-dark mt-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-luxury text-text-primary mb-4">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={cat.id}
                checked={selectedCategory === String(cat.id)}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded border-border-custom text-gold-primary accent-gold-primary"
              />
              <span className="text-text-secondary hover:text-text-primary text-sm">
                {cat.name}
              </span>
            </label>
          ))}
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(1);
              }}
              className="text-sm text-gold-primary hover:text-gold-dark mt-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-luxury text-text-primary mb-4">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-text-secondary">Min: Rs. {priceRange.min.toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange.min}
              onChange={(e) => {
                setPriceRange({ ...priceRange, min: parseInt(e.target.value) });
                setPage(1);
              }}
              className="w-full accent-gold-primary"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary">Max: Rs. {priceRange.max.toLocaleString()}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={priceRange.max}
              onChange={(e) => {
                setPriceRange({ ...priceRange, max: parseInt(e.target.value) });
                setPage(1);
              }}
              className="w-full accent-gold-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-luxury text-text-primary mb-4">Sort By</h3>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2.5 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-bg-primary text-text-primary"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      <button
        onClick={handleResetFilters}
        className="w-full py-2.5 px-4 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-custom py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
            The Boutique
          </p>
          <h1 className="text-4xl md:text-5xl font-luxury text-text-primary">
            Gift <span className="text-gold-primary italic">Collections</span>
          </h1>
          <p className="text-text-secondary mt-3">
            Browse our premium selection of luxury gifts
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className={filtersOpen ? "block lg:block" : "hidden lg:block"}>
            <div className="lg:sticky lg:top-28">
              {filters}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-bg-card rounded-2xl border border-border-custom animate-pulse">
                    <div className="aspect-square bg-bg-secondary rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-border-custom rounded w-3/4"></div>
                      <div className="h-4 bg-border-custom rounded w-1/2"></div>
                      <div className="h-6 bg-gold-primary/20 rounded w-1/3 mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <X className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                <p className="text-text-secondary text-lg">No products found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-card disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === i + 1
                            ? "bg-gold-primary text-white"
                            : "border border-border-custom text-text-primary hover:bg-bg-card"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-card disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

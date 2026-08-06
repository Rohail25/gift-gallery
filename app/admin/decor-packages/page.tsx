"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Package, Image as ImageIcon } from "lucide-react";

interface DecorPackage {
  id: number;
  name: string;
  slug: string;
  package_code: string;
  starting_price: number;
  average_rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_visible: boolean;
  status: string;
  images: Array<{ image_url: string; is_primary: boolean }>;
  decor_category: {
    name: string;
    event_type: {
      name: string;
    } | null;
  } | null;
}

export default function AdminDecorPackagesPage() {
  const [packages, setPackages] = useState<DecorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        if (search) params.append("search", search);

        const res = await fetch(`/api/decor-packages?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setPackages(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      const res = await fetch(`/api/decor-packages?id=${id}`, { method: "DELETE" });
      if (res.ok) setPackages(packages.filter((p) => p.id !== id));
      else alert("Failed to delete");
    } catch {
      alert("An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      inactive: "bg-yellow-100 text-yellow-800",
      archived: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-card rounded-lg border border-border-custom p-6 h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Decor Packages</h1>
          <p className="text-text-secondary mt-1">Manage event decoration packages</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search packages..."
            className="px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white w-64"
          />
          <Link
            href="/admin/decorators/new"
            className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
          >
            <Plus className="w-5 h-5" />
            Add Package
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-bg-card rounded-lg border border-border-custom">
            <Package className="w-12 h-12 mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No packages found</p>
          </div>
        ) : (
          packages.map((pkg) => {
            const primaryImage =
              pkg.images?.find((img) => img.is_primary)?.image_url ||
              pkg.images?.[0]?.image_url;
            return (
              <div
                key={pkg.id}
                className="bg-bg-card rounded-lg border border-border-custom p-6 hover:shadow-lg transition"
              >
                <div className="relative h-36 rounded-lg overflow-hidden bg-bg-primary mb-4">
                  {primaryImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-primary/10 to-rose-gold/10">
                      <ImageIcon className="w-10 h-10 text-text-secondary" />
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-luxury text-lg text-text-primary">{pkg.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {pkg.decor_category?.event_type?.name || "General"} -{" "}
                      {pkg.decor_category?.name || "Uncategorized"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(pkg.status)}`}>
                    {pkg.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Starting Price</span>
                    <span className="font-medium text-text-primary">
                      Rs. {Math.round(pkg.starting_price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Avg Rating</span>
                    <span className="font-medium text-gold-primary">{pkg.average_rating} ({pkg.reviews_count})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border-custom">
                  <Link
                    href={`/admin/decorators/${pkg.id}/edit`}
                    className="flex-1 py-2 px-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-text-secondary">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Packages</p>
          <p className="text-2xl font-luxury text-gold-primary">{packages.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-luxury text-green-600">
            {packages.filter((p) => p.status === "active").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Featured</p>
          <p className="text-2xl font-luxury text-purple-600">
            {packages.filter((p) => p.is_featured).length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Visible</p>
          <p className="text-2xl font-luxury text-blue-600">
            {packages.filter((p) => p.is_visible).length}
          </p>
        </div>
      </div>
    </div>
  );
}
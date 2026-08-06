"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  status: string;
  is_visible: boolean;
  _count?: { products: number };
  giftTypes: Array<{
    gift_type: { name: string; slug: string };
  }>;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
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

        const res = await fetch(`/api/product-categories?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setCategories(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
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
    if (!confirm("Are you sure you want to delete this category?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/product-categories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setDeleting(null);
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
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-bg-secondary rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Categories</h1>
          <p className="text-text-secondary mt-1">Manage product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-bg-card rounded-lg border border-border-custom p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name or slug..."
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg hover:bg-bg-secondary transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Image</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Gift Events</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Products</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Sort</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Visibility</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-secondary">
                    No categories found. Create your first one!
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      {category.image_url ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg-secondary">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-bg-secondary flex items-center justify-center">
                          <span className="text-text-secondary text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(category.giftTypes || []).map((gt, i) => (
                          <span
                            key={i}
                            className="text-xs bg-bg-secondary text-text-primary px-2 py-1 rounded"
                          >
                            {gt.gift_type.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary font-medium">
                        {category._count?.products || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary">{category.sort_order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(category.status)}`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        category.is_visible
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {category.is_visible ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={deleting === category.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border-custom">
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
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface DecorCategory {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  sort_order: number;
  status: string;
  is_visible: boolean;
  event_type?: {
    name: string;
    slug: string;
  };
  _count?: {
    packages: number;
  };
}

export default function AdminDecorCategoriesPage() {
  const [categories, setCategories] = useState<DecorCategory[]>([]);
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

        const res = await fetch(`/api/decor-categories?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setCategories(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching decor categories:", error);
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
    if (!confirm("Are you sure you want to delete this decor category?")) return;

    try {
      const res = await fetch(`/api/decor-categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      const res = await fetch(`/api/decor-categories?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !currentVisibility }),
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(categories.map((c) => (c.id === id ? data.data : c)));
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
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

  if (loading && categories.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Decor Categories</h1>
          <p className="text-text-secondary mt-1">Manage decoration package categories</p>
        </div>
        <Link
          href="/admin/decor-categories/new"
          className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </Link>
      </div>

      <div className="bg-bg-card rounded-lg border border-border-custom p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
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
          <button
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="px-4 py-2 border border-border-custom rounded-lg hover:bg-bg-secondary transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Event Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Slug</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Packages</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Sort Order</th>
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
                      <div>
                        <p className="font-medium text-text-primary">{category.name}</p>
                        {category.short_description && (
                          <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                            {category.short_description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary">{category.event_type?.name || "-"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-primary font-medium">
                        {category._count?.packages || 0}
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
                      <button
                        onClick={() => handleToggleVisibility(category.id, category.is_visible)}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full transition ${
                          category.is_visible
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
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
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/decor-categories/${category.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Eye, Package, AlertTriangle, Upload, Download } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_visible: boolean;
  status: string;
  created_at: string;
  images: Array<{ image_url: string; is_primary: boolean }>;
  product_category: {
    name: string;
    giftTypes: Array<{
      gift_type: {
        name: string;
      };
    }>;
  };
}

async function fetchProductsApi(params: {
  page: number;
  search: string;
  filter: string;
}) {
  const sp = new URLSearchParams();
  sp.append("page", params.page.toString());
  sp.append("limit", "20");
  if (params.search) sp.append("search", params.search);
  if (params.filter !== "all") sp.append("status", params.filter);

  const res = await fetch(`/api/admin/products?${sp.toString()}`);
  return res.json();
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchProductsApi({ page, search, filter });
        if (!cancelled) {
          setProducts(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, filter]);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult({
          created: data.created || 0,
          skipped: data.skipped || 0,
          errors: data.errors || [],
        });
        const refreshed = await fetchProductsApi({ page, search, filter });
        setProducts(refreshed.data || []);
        setTotalPages(refreshed.meta?.totalPages || 1);
      } else {
        alert(data.error || "Import failed");
      }
    } catch (error) {
      alert("An error occurred during import");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "In Stock", color: "bg-green-100 text-green-800" };
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-luxury text-gold-primary">Products</h1>
          <p className="text-text-secondary mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-5 py-3 border border-gold-primary text-gold-primary rounded-lg hover:bg-gold-primary hover:text-white transition cursor-pointer">
            <Upload className="w-5 h-5" />
            Bulk Import
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportFile}
              disabled={importing}
            />
          </label>
          <Link
            href="/api/admin/products/import-template"
            className="inline-flex items-center gap-2 px-5 py-3 border border-border-custom text-text-secondary rounded-lg hover:bg-bg-secondary transition"
          >
            <Download className="w-5 h-5" />
            Template
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Import status */}
      {importing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
          Importing products from Excel file...
        </div>
      )}
      {importResult && (
        <div className={`p-4 border rounded-lg ${importResult.created > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
          <p className="font-medium">
            {importResult.created} product(s) imported, {importResult.skipped} skipped.
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm list-disc pl-5 max-h-40 overflow-y-auto">
              {importResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
          <button
            onClick={() => setImportResult(null)}
            className="mt-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
              placeholder="Search by name, SKU..."
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setFilter("all");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg hover:bg-bg-secondary transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Product</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Stock</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-bg-secondary/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                              <Image
                                src={product.images[0].image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0">
                              <Package className="w-6 h-6 text-text-secondary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary line-clamp-1">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {product.is_featured && (
                                <span className="text-xs bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded">
                                  Featured
                                </span>
                              )}
                              {!product.is_visible && (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-sm text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                          {product.sku}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-text-primary font-medium">{product.product_category.name}</p>
                          <p className="text-text-secondary text-xs">
                            {product.product_category.giftTypes.map((gt) => gt.gift_type.name).join(", ")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-text-primary font-medium">
                            Rs. {Math.round(product.sale_price || product.regular_price).toLocaleString()}
                          </p>
                          {product.sale_price && (
                            <p className="text-text-secondary line-through text-xs">
                              Rs. {Math.round(product.regular_price).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                          <span className="text-sm text-text-secondary">({product.stock_quantity})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          product.status === "active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "draft"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Products</p>
          <p className="text-2xl font-luxury text-gold-primary">{products.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Low Stock</p>
          <p className="text-2xl font-luxury text-yellow-600">
            {products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Out of Stock</p>
          <p className="text-2xl font-luxury text-red-600">
            {products.filter((p) => p.stock_quantity === 0).length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Featured</p>
          <p className="text-2xl font-luxury text-purple-600">
            {products.filter((p) => p.is_featured).length}
          </p>
        </div>
      </div>
    </div>
  );
}

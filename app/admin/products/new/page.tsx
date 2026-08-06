"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function AdminProductFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    product_category_id: 0,
    name: "",
    slug: "",
    sku: "",
    short_description: "",
    description: "",
    regular_price: 0,
    sale_price: 0,
    cost_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 10,
    is_featured: false,
    is_visible: true,
    status: "active",
    meta_title: "",
    meta_description: "",
  });

  const [images, setImages] = useState<Array<{ id: number; image_url: string; is_primary: boolean }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await fetch("/api/product-categories");
        const data = await res.json();
        if (!cancelled) setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    async function loadProduct() {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        if (!cancelled && data.data) {
          setFormData(data.data);
          setImages(data.data.images || []);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    loadCategories();
    if (isEditing) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [isEditing, params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "product_category_id" || type === "number"
            ? Number(value)
            : value,
    }));

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(value),
      }));
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setImages((prev) => [
          ...prev,
          {
            id: Date.now(),
            image_url: data.url,
            is_primary: prev.length === 0,
          },
        ]);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (id: number) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const handleSetPrimary = (id: number) => {
    setImages(
      images.map((img) => ({
        ...img,
        is_primary: img.id === id,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const productPayload = {
        ...formData,
        regular_price: Number(formData.regular_price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        stock_quantity: Number(formData.stock_quantity),
        low_stock_threshold: Number(formData.low_stock_threshold),
        images: images.map((img, index) => ({
          image_url: img.image_url,
          sort_order: index,
          is_primary: img.is_primary,
        })),
      };

      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing ? `/api/admin/products/${params.id}` : "/api/admin/products";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEditing ? "Product updated successfully!" : "Product created successfully!");
        setTimeout(() => {
          router.push("/admin/products");
        }, 1500);
      } else {
        setError(data.error || "Failed to save product");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-bg-secondary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Add New"} Product
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? "Update product details" : "Create a new product"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Auto-generated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      SKU *
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="e.g., PRD-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    maxLength={200}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="Brief product description (200 chars max)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="Detailed product description..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Pricing</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Regular Price (PKR) *
                  </label>
                  <input
                    type="number"
                    name="regular_price"
                    value={formData.regular_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sale Price (PKR)
                  </label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Cost Price (PKR)
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="For internal use"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Inventory</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Product Images</h2>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Add Image
                    </>
                  )}
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </div>

              {images.length > 0 && (
                <div className="space-y-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="flex items-center gap-4 p-3 bg-bg-secondary rounded-lg"
                    >
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 text-sm">
                        <p className="text-text-primary font-medium">{img.image_url}</p>
                        {img.is_primary && (
                          <span className="text-xs bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded">
                            Primary Image
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!img.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(img.id)}
                            className="px-3 py-1 text-xs border border-gold-primary text-gold-primary rounded hover:bg-gold-primary hover:text-white transition"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-text-secondary mt-4">
                First image will be used as the primary image on product cards.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Category</h2>
              <select
                name="product_category_id"
                value={formData.product_category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              >
                <option value={0}>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Status</h2>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_visible"
                    checked={formData.is_visible}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
                  />
                  <span className="text-sm text-text-primary">Visible on website</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
                  />
                  <span className="text-sm text-text-primary">Featured product</span>
                </label>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleChange}
                    maxLength={60}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    {formData.meta_title.length}/60
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    {formData.meta_description.length}/160
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
              </button>
              <Link
                href="/admin/products"
                className="block w-full mt-3 py-3 px-4 text-center border border-border-custom text-text-primary font-medium rounded-lg hover:bg-bg-secondary transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface GiftType {
  id: number;
  name: string;
}

export default function AdminCategoryFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

  const [giftTypes, setGiftTypes] = useState<GiftType[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    image_alt_text: "",
    meta_title: "",
    meta_description: "",
    sort_order: 0,
    status: "draft",
    is_visible: false,
  });
  const [selectedGiftTypeIds, setSelectedGiftTypeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadGiftTypes() {
      try {
        const res = await fetch("/api/gift-types");
        const data = await res.json();
        if (!cancelled) setGiftTypes(data.data || []);
      } catch (error) {
        console.error("Error fetching gift types:", error);
      }
    }

    async function loadCategory() {
      try {
        const res = await fetch(`/api/product-categories?id=${params.id}`);
        const data = await res.json();
        const category = data.data?.[0];
        if (!cancelled && category) {
          setFormData({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
            image_url: category.image_url || "",
            image_alt_text: category.image_alt_text || "",
            meta_title: category.meta_title || "",
            meta_description: category.meta_description || "",
            sort_order: category.sort_order || 0,
            status: category.status || "draft",
            is_visible: category.is_visible ?? false,
          });
          setSelectedGiftTypeIds(
            (category.giftTypes || []).map((gt: { gift_type_id: number }) => gt.gift_type_id)
          );
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    }

    loadGiftTypes();
    if (isEditing) {
      loadCategory();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, params?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(value),
      }));
    }
  };

  const toggleGiftType = (id: number) => {
    setSelectedGiftTypeIds((prev) =>
      prev.includes(id) ? prev.filter((gid) => gid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (selectedGiftTypeIds.length === 0) {
      setError("Select at least one gift event.");
      setLoading(false);
      return;
    }

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing
        ? `/api/product-categories?id=${params.id}`
        : "/api/product-categories";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          gift_type_ids: selectedGiftTypeIds,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEditing ? "Category updated successfully!" : "Category created successfully!");
        setTimeout(() => {
          router.push("/admin/categories");
        }, 1200);
      } else {
        setError(data.error || "Failed to save category");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 hover:bg-bg-secondary rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Add New"} Category
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? "Update category details" : "Create a new category"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, image_url: url }))
                  }
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    name="image_alt_text"
                    value={formData.image_alt_text}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Gift Events */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">
                Gift Events <span className="text-red-500">*</span>
              </h2>
              <p className="text-sm text-text-secondary mb-3">
                Select one or more gift events this category belongs to.
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {giftTypes.map((giftType) => (
                  <label
                    key={giftType.id}
                    className="flex items-center gap-3 p-3 bg-bg-secondary rounded-lg cursor-pointer hover:bg-gold-primary/10 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGiftTypeIds.includes(giftType.id)}
                      onChange={() => toggleGiftType(giftType.id)}
                      className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
                    />
                    <span className="text-sm text-text-primary">{giftType.name}</span>
                  </label>
                ))}
              </div>
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

              <label className="flex items-center gap-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_visible"
                  checked={formData.is_visible}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
                />
                <span className="text-sm text-text-primary">Visible on website</span>
              </label>
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
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
              </button>
              <Link
                href="/admin/categories"
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

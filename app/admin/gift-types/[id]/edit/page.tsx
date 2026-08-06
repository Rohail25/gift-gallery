"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminGiftTypeFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    async function loadGiftType() {
      try {
        const res = await fetch(`/api/gift-types?id=${params.id}`);
        const data = await res.json();
        const giftType = data.data?.[0];
        if (!cancelled && giftType) {
          setFormData({
            name: giftType.name || "",
            slug: giftType.slug || "",
            description: giftType.description || "",
            image_url: giftType.image_url || "",
            image_alt_text: giftType.image_alt_text || "",
            meta_title: giftType.meta_title || "",
            meta_description: giftType.meta_description || "",
            sort_order: giftType.sort_order || 0,
            status: giftType.status || "draft",
            is_visible: giftType.is_visible ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching gift type:", error);
      }
    }

    loadGiftType();
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

    // Auto-generate slug
    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing ? `/api/gift-types?id=${params.id}` : "/api/gift-types";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEditing ? "Gift type updated successfully!" : "Gift type created successfully!");
        setTimeout(() => {
          router.push("/admin/gift-types");
        }, 1500);
      } else {
        setError(data.error || "Failed to save gift type");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/gift-types"
          className="p-2 hover:bg-bg-secondary rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Create"} Gift Event
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? "Update gift event details" : "Add a new gift event type"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-bg-card rounded-lg border border-border-custom p-6 space-y-6">
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

        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-luxury text-text-primary mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                placeholder="e.g., Wedding Gifts"
              />
            </div>

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
                placeholder="Auto-generated from name"
              />
              <p className="text-xs text-text-secondary mt-1">URL-friendly identifier</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                placeholder="Enter gift event description..."
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
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                placeholder="0"
              />
              <p className="text-xs text-text-secondary mt-1">Lower numbers appear first</p>
            </div>
          </div>
        </div>

        {/* Image */}
        <div>
          <h2 className="text-xl font-luxury text-text-primary mb-4">Image</h2>
          <div className="space-y-4">
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
                placeholder="Describe the image for accessibility"
              />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div>
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
                placeholder="Page title for search engines"
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
                placeholder="Page description for search engines"
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData.meta_description.length}/160
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-xl font-luxury text-text-primary mb-4">Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Status
              </label>
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
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_visible"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
              />
              <label htmlFor="is_visible" className="text-sm font-medium text-text-primary">
                Visible on Website
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-border-custom">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : isEditing ? "Update Gift Event" : "Create Gift Event"}
          </button>
          <Link
            href="/admin/gift-types"
            className="px-6 py-3 border border-border-custom text-text-primary font-medium rounded-lg hover:bg-bg-secondary transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

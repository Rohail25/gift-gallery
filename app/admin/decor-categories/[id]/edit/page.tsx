"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { slugify } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface EventType {
  id: number;
  name: string;
  slug: string;
}

export default function AdminDecorCategoryFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [formData, setFormData] = useState({
    event_type_id: 0,
    name: "",
    slug: "",
    short_description: "",
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

  useEffect(() => {
    let cancelled = false;

    async function loadEventTypes() {
      try {
        const res = await fetch("/api/event-types");
        const data = await res.json();
        if (!cancelled) setEventTypes(data.data || []);
      } catch (error) {
        console.error("Error fetching event types:", error);
      }
    }

    loadEventTypes();

    if (!isEditing) {
      return () => {
        cancelled = true;
      };
    }

    async function loadCategory() {
      try {
        const res = await fetch(`/api/decor-categories?id=${params.id}`);
        const data = await res.json();
        const category = data.data;
        if (!cancelled && category) {
          setFormData({
            event_type_id: category.event_type_id || 0,
            name: category.name || "",
            slug: category.slug || "",
            short_description: category.short_description || "",
            description: category.description || "",
            image_url: category.image_url || "",
            image_alt_text: category.image_alt_text || "",
            meta_title: category.meta_title || "",
            meta_description: category.meta_description || "",
            sort_order: category.sort_order || 0,
            status: category.status || "draft",
            is_visible: category.is_visible ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching decor category:", error);
      }
    }

    loadCategory();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      event_type_id: Number(formData.event_type_id),
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing
        ? `/api/decor-categories?id=${params.id}`
        : "/api/decor-categories";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert(isEditing ? "Category updated successfully!" : "Category created successfully!");
        router.push("/admin/decor-categories");
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/decor-categories" className="p-2 hover:bg-bg-secondary rounded-lg">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Create"} Decor Category
          </h1>
          <p className="text-text-secondary mt-1">Manage decoration package categories</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-bg-card rounded-lg border border-border-custom p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Event Type *</label>
            <select
              name="event_type_id"
              value={formData.event_type_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            >
              <option value={0}>Select Event Type</option>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              placeholder="e.g., Floral Theme"
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
              placeholder="Auto-generated"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Short Description</label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
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
            <label className="block text-sm font-medium text-text-primary mb-1">Meta Title</label>
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
            <label className="block text-sm font-medium text-text-primary mb-1">Meta Description</label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
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
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_visible"
              checked={formData.is_visible}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border-custom text-gold-primary"
            />
            <span className="text-sm text-text-primary">Visible on Website</span>
          </label>
        </div>

        <div className="flex gap-4 pt-6 border-t border-border-custom">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
          </button>
          <Link
            href="/admin/decor-categories"
            className="flex-1 py-3 px-4 border border-border-custom text-text-primary font-medium rounded-lg hover:bg-bg-secondary transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

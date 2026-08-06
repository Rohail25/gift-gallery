"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

interface DecorCategory {
  id: number;
  name: string;
  event_type: { name: string };
}

export default function AdminDecoratorFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

  const [categories, setCategories] = useState<DecorCategory[]>([]);
  const [cities, setCities] = useState<Array<{ id: number; name: string; province: string | null }>>([]);
  const [includedItemsText, setIncludedItemsText] = useState("");
  const [excludedItemsText, setExcludedItemsText] = useState("");
  const [formData, setFormData] = useState({
    decor_category_id: 0,
    name: "",
    package_code: "",
    short_description: "",
    description: "",
    terms_and_conditions: "",
    starting_price: 0,
    sale_price: 0,
    estimated_setup_hours: 0,
    maximum_guests: 0,
    service_city: "",
    is_featured: false,
    is_visible: true,
    status: "draft",
    meta_title: "",
    meta_description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [images, setImages] = useState<Array<{ id: number; image_url: string; is_primary: boolean }>>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await fetch("/api/decor-categories");
        const data = await res.json();
        if (!cancelled) setCategories(data.data || []);
      } catch (error) {
        console.error("Error fetching decor categories:", error);
      }
    }

    async function loadCities() {
      try {
        const res = await fetch("/api/cities");
        const data = await res.json();
        if (!cancelled) setCities(data.data || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }

    async function loadPackage() {
      try {
        const res = await fetch(`/api/decor-packages/${params.id}`);
        const data = await res.json();
        const pkg = data.data;
        if (!cancelled && pkg) {
          setFormData({
            decor_category_id: pkg.decor_category_id || 0,
            name: pkg.name || "",
            package_code: pkg.package_code || "",
            short_description: pkg.short_description || "",
            description: pkg.description || "",
            terms_and_conditions: pkg.terms_and_conditions || "",
            starting_price: Number(pkg.starting_price || 0),
            sale_price: pkg.sale_price ? Number(pkg.sale_price) : 0,
            estimated_setup_hours: pkg.estimated_setup_hours || 0,
            maximum_guests: pkg.maximum_guests || 0,
            service_city: pkg.service_city || "",
            is_featured: pkg.is_featured ?? false,
            is_visible: pkg.is_visible ?? true,
            status: pkg.status || "draft",
            meta_title: pkg.meta_title || "",
            meta_description: pkg.meta_description || "",
          });
          setIncludedItemsText(Array.isArray(pkg.included_items) ? pkg.included_items.join("\n") : "");
          setExcludedItemsText(
            Array.isArray(pkg.excluded_items) ? pkg.excluded_items.join("\n") : ""
          );
          setImages(
            Array.isArray(pkg.images)
              ? pkg.images.map((img: { id: number; image_url: string; is_primary: boolean }) => ({
                  id: img.id,
                  image_url: img.image_url,
                  is_primary: img.is_primary,
                }))
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      }
    }

    loadCategories();
    loadCities();
    if (isEditing) {
      loadPackage();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, params?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    const numericFields = new Set([
      "decor_category_id",
      "starting_price",
      "sale_price",
      "estimated_setup_hours",
      "maximum_guests",
    ]);

    let nextValue: string | number | boolean = type === "checkbox" ? checked : value;
    if (numericFields.has(name) && nextValue !== "") {
      nextValue = Number(nextValue);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        package_code: prev.package_code || "PKG-" + value.trim().toUpperCase().replace(/\s+/g, "-"),
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
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      starting_price: Number(formData.starting_price),
      sale_price: formData.sale_price ? Number(formData.sale_price) : undefined,
      estimated_setup_hours: formData.estimated_setup_hours
        ? Number(formData.estimated_setup_hours)
        : undefined,
      maximum_guests: formData.maximum_guests ? Number(formData.maximum_guests) : undefined,
      included_items: includedItemsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      excluded_items: excludedItemsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      images: images.map((img) => ({
        image_url: img.image_url,
        is_primary: img.is_primary,
      })),
      slug: slugify(formData.name),
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing
        ? `/api/decor-packages?id=${params.id}`
        : "/api/decor-packages";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEditing ? "Package updated successfully!" : "Package created successfully!");
        setTimeout(() => {
          router.push("/admin/decor-packages");
        }, 1200);
      } else {
        setError(data.error || "Failed to save package");
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
        <Link href="/admin/decor-packages" className="p-2 hover:bg-bg-secondary rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Add New"} Decor Package
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? "Update package details" : "Create a new decoration package"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Package Name *
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
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Package Code
                    </label>
                    <input
                      type="text"
                      name="package_code"
                      value={formData.package_code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Included Items (one per line) *
                  </label>
                  <textarea
                    value={includedItemsText}
                    onChange={(e) => setIncludedItemsText(e.target.value)}
                    rows={5}
                    required
                    placeholder={"Floral centerpieces\nStage backdrop\nLighting setup"}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Excluded Items (one per line)
                  </label>
                  <textarea
                    value={excludedItemsText}
                    onChange={(e) => setExcludedItemsText(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms_and_conditions"
                    value={formData.terms_and_conditions}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Package Images</h2>

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
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 text-sm">
                        <p className="text-text-primary font-medium break-all">{img.image_url}</p>
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
                First image will be used as the primary image on package cards.
              </p>
            </div>

            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Pricing & Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Starting Price (PKR) *
                  </label>
                  <input
                    type="number"
                    name="starting_price"
                    value={formData.starting_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Estimated Setup Hours
                  </label>
                  <input
                    type="number"
                    name="estimated_setup_hours"
                    value={formData.estimated_setup_hours || ""}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Maximum Guests
                  </label>
                  <input
                    type="number"
                    name="maximum_guests"
                    value={formData.maximum_guests || ""}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Service City
                  </label>
                  <select
                    name="service_city"
                    value={formData.service_city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                  >
                    <option value="">Select City</option>
                    {formData.service_city &&
                      !cities.some((city) => city.name === formData.service_city) && (
                        <option value={formData.service_city}>{formData.service_city}</option>
                      )}
                    {cities.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                        {city.province ? ` (${city.province})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Category</h2>
              <select
                name="decor_category_id"
                value={formData.decor_category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              >
                <option value={0}>Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.event_type.name} - {cat.name}
                  </option>
                ))}
              </select>
            </div>

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
                  <span className="text-sm text-text-primary">Featured package</span>
                </label>
              </div>
            </div>

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

            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : isEditing ? "Update Package" : "Create Package"}
              </button>
              <Link
                href="/admin/decor-packages"
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

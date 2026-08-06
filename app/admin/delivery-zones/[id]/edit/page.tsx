"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function AdminDeliveryZoneFormPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const isEditing = !!params?.id;

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    area: "",
    delivery_charge: 0,
    minimum_order_amount: 0,
    free_delivery_minimum: 0,
    estimated_min_minutes: 0,
    estimated_max_minutes: 0,
    cash_on_delivery_available: true,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cities, setCities] = useState<Array<{ id: number; name: string; province?: string | null }>>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        const res = await fetch("/api/cities");
        const data = await res.json();
        if (!cancelled) setCities(data.data || []);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    }

    loadCities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    let cancelled = false;

    async function loadZone() {
      try {
        const res = await fetch(`/api/delivery-zones?id=${params.id}`);
        const data = await res.json();
        const zone = data.data?.[0];
        if (!cancelled && zone) {
          setFormData({
            name: zone.name || "",
            city: zone.city || "",
            area: zone.area || "",
            delivery_charge: Number(zone.delivery_charge || 0),
            minimum_order_amount: Number(zone.minimum_order_amount || 0),
            free_delivery_minimum: zone.free_delivery_minimum
              ? Number(zone.free_delivery_minimum)
              : 0,
            estimated_min_minutes: zone.estimated_min_minutes || 0,
            estimated_max_minutes: zone.estimated_max_minutes || 0,
            cash_on_delivery_available: zone.cash_on_delivery_available ?? true,
            is_active: zone.is_active ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching delivery zone:", error);
      }
    }

    loadZone();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, params?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...formData,
      delivery_charge: Number(formData.delivery_charge),
      minimum_order_amount: Number(formData.minimum_order_amount),
      free_delivery_minimum: formData.free_delivery_minimum
        ? Number(formData.free_delivery_minimum)
        : null,
      estimated_min_minutes: formData.estimated_min_minutes
        ? Number(formData.estimated_min_minutes)
        : null,
      estimated_max_minutes: formData.estimated_max_minutes
        ? Number(formData.estimated_max_minutes)
        : null,
    };

    try {
      const method = isEditing ? "PUT" : "POST";
      const endpoint = isEditing
        ? `/api/delivery-zones?id=${params.id}`
        : "/api/delivery-zones";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(isEditing ? "Zone updated successfully!" : "Zone created successfully!");
        setTimeout(() => {
          router.push("/admin/delivery-zones");
        }, 1200);
      } else {
        setError(data.error || "Failed to save delivery zone");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/delivery-zones" className="p-2 hover:bg-bg-secondary rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-text-primary" />
        </Link>
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">
            {isEditing ? "Edit" : "Add New"} Delivery Zone
          </h1>
          <p className="text-text-secondary mt-1">
            {isEditing ? "Update zone details" : "Create a new delivery zone"}
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

        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <h2 className="text-xl font-luxury text-text-primary mb-4">Zone Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Zone Name *</label>
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
              <label className="block text-sm font-medium text-text-primary mb-1">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              >
                <option value="" disabled>
                  Select City
                </option>
                {formData.city &&
                  !cities.some((c) => c.name === formData.city) && (
                    <option value={formData.city}>{formData.city}</option>
                  )}
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                    {city.province ? ` (${city.province})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Area *</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Delivery Charge (PKR) *
              </label>
              <input
                type="number"
                name="delivery_charge"
                value={formData.delivery_charge}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Minimum Order Amount (PKR) *
              </label>
              <input
                type="number"
                name="minimum_order_amount"
                value={formData.minimum_order_amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Free Delivery Minimum (PKR)
              </label>
              <input
                type="number"
                name="free_delivery_minimum"
                value={formData.free_delivery_minimum || ""}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Estimated Min Minutes
              </label>
              <input
                type="number"
                name="estimated_min_minutes"
                value={formData.estimated_min_minutes || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Estimated Max Minutes
              </label>
              <input
                type="number"
                name="estimated_max_minutes"
                value={formData.estimated_max_minutes || ""}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
              />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="cash_on_delivery_available"
                checked={formData.cash_on_delivery_available}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
              />
              <span className="text-sm text-text-primary">Cash on delivery available</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border-custom text-gold-primary focus:ring-gold-primary"
              />
              <span className="text-sm text-text-primary">Zone is active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : isEditing ? "Update Zone" : "Create Zone"}
          </button>
          <Link
            href="/admin/delivery-zones"
            className="py-3 px-4 text-center border border-border-custom text-text-primary font-medium rounded-lg hover:bg-bg-secondary transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";

interface DeliveryZone {
  id: number;
  name: string;
  city: string;
  area: string;
  delivery_charge: number;
  minimum_order_amount: number;
  free_delivery_minimum?: number;
  estimated_min_minutes?: number;
  estimated_max_minutes?: number;
  cash_on_delivery_available: boolean;
  is_active: boolean;
  created_at: string;
}

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
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

        const res = await fetch(`/api/delivery-zones?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setZones(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching zones:", error);
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
    if (!confirm("Are you sure you want to delete this delivery zone?")) return;
    try {
      const res = await fetch(`/api/delivery-zones?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setZones(zones.filter((z) => z.id !== id));
      } else {
        alert("Failed to delete - this zone may have orders");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/delivery-zones?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setZones(zones.map((z) => (z.id === id ? data.data : z)));
      }
    } catch (error) {
      console.error("Error toggling zone:", error);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Delivery Zones</h1>
          <p className="text-text-secondary mt-1">Manage delivery areas and charges</p>
        </div>
        <Link
          href="/admin/delivery-zones/new"
          className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
        >
          <Plus className="w-5 h-5" />
          Add Zone
        </Link>
      </div>

      <div className="bg-bg-card rounded-lg border border-border-custom p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Zone name..."
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-bg-card rounded-lg border border-border-custom">
            <MapPin className="w-12 h-12 mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">No delivery zones found</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={zone.id}
              className={`bg-bg-card rounded-lg border border-border-custom p-6 hover:shadow-lg transition ${
                !zone.is_active && "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-luxury text-lg text-text-primary">{zone.name}</h3>
                  <p className="text-sm text-text-secondary">
                    {zone.city} • {zone.area}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    zone.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {zone.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Delivery Charge</span>
                  <span className="font-medium text-text-primary">
                    Rs. {zone.delivery_charge.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Min. Order</span>
                  <span className="font-medium text-text-primary">
                    Rs. {zone.minimum_order_amount.toLocaleString()}
                  </span>
                </div>
                {zone.free_delivery_minimum && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Free Delivery</span>
                    <span className="font-medium text-green-600">
                      Rs. {zone.free_delivery_minimum.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">COD Available</span>
                  <span
                    className={`font-medium ${
                      zone.cash_on_delivery_available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {zone.cash_on_delivery_available ? "Yes" : "No"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border-custom">
                <button
                  onClick={() => handleToggleActive(zone.id, zone.is_active)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition ${
                    zone.is_active
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {zone.is_active ? "Deactivate" : "Activate"}
                </button>
                <Link
                  href={`/admin/delivery-zones/${zone.id}/edit`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(zone.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border border-border-custom rounded-lg bg-bg-card">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Zones</p>
          <p className="text-2xl font-luxury text-gold-primary">{zones.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Active Zones</p>
          <p className="text-2xl font-luxury text-green-600">
            {zones.filter((z) => z.is_active).length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Cities Covered</p>
          <p className="text-2xl font-luxury text-blue-600">
            {new Set(zones.map((z) => z.city)).size}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">COD Enabled</p>
          <p className="text-2xl font-luxury text-purple-600">
            {zones.filter((z) => z.cash_on_delivery_available).length}
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Truck, Bike, Car } from "lucide-react";

interface Rider {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  status: string;
  last_login_at?: string | null;
  created_at: string;
  riderProfile?: {
    vehicle_type?: string | null;
    vehicle_number?: string | null;
    availability_status: string;
  } | null;
  _count?: { riderAssignments: number };
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
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

        const res = await fetch(`/api/admin/riders?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setRiders(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching riders:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const handleToggleAvailability = async (rider: Rider) => {
    const current = rider.riderProfile?.availability_status || "available";
    const next = current === "available" ? "unavailable" : "available";

    try {
      const res = await fetch(`/api/admin/riders?id=${rider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability_status: next }),
      });

      if (res.ok) {
        setRiders(
          riders.map((r) =>
            r.id === rider.id
              ? {
                  ...r,
                  riderProfile: { ...r.riderProfile, availability_status: next },
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleToggleStatus = async (rider: Rider) => {
    const next = rider.status === "active" ? "suspended" : "active";

    try {
      const res = await fetch(`/api/admin/riders?id=${rider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (res.ok) {
        setRiders(riders.map((r) => (r.id === rider.id ? { ...r, status: next } : r)));
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
          <h1 className="text-3xl font-luxury text-gold-primary">Riders</h1>
          <p className="text-text-secondary mt-1">Manage delivery riders</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search riders..."
          className="px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white w-64"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Riders</p>
          <p className="text-2xl font-luxury text-gold-primary">{riders.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Available</p>
          <p className="text-2xl font-luxury text-green-600">
            {riders.filter((r) => r.riderProfile?.availability_status === "available").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Active Deliveries</p>
          <p className="text-2xl font-luxury text-blue-600">
            {riders.reduce((sum, r) => sum + (r._count?.riderAssignments || 0), 0)}
          </p>
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Rider</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Vehicle</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Availability</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Active Deliveries</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Account Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {riders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-secondary">
                    No riders found
                  </td>
                </tr>
              ) : (
                riders.map((rider) => (
                  <tr key={rider.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center">
                          <Truck className="w-5 h-5 text-gold-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{rider.full_name}</p>
                          <p className="text-xs text-text-secondary">{rider.email}</p>
                          {rider.phone && (
                            <p className="text-xs text-text-secondary">{rider.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-text-secondary" />
                        <div>
                          <p className="text-sm text-text-primary">
                            {rider.riderProfile?.vehicle_type || "Not specified"}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {rider.riderProfile?.vehicle_number || ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAvailability(rider)}
                        className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full transition ${
                          rider.riderProfile?.availability_status === "available"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        <Bike className="w-3 h-3" />
                        {rider.riderProfile?.availability_status === "available"
                          ? "Available"
                          : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">
                        {rider._count?.riderAssignments || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(rider)}
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full transition ${
                          rider.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {rider.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-text-secondary">
                        Joined {new Date(rider.created_at).toLocaleDateString()}
                      </span>
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

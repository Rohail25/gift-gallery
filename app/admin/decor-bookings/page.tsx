"use client";

import { useState, useEffect } from "react";
import { Calendar, Package, User } from "lucide-react";

interface DecorBooking {
  id: number;
  booking_number: string;
  event_date: string;
  booking_status: string;
  quoted_amount?: number | string | null;
  final_amount?: number | string | null;
  guest_count?: number | null;
  created_at: string;
  user: { full_name: string; email: string; phone?: string | null };
  decor_package: { id: number; name: string; package_code: string };
  event_type: { id: number; name: string };
}

const BOOKING_STATUSES = [
  "pending",
  "under_review",
  "site_visit_required",
  "site_visit_completed",
  "quotation_sent",
  "customer_approved",
  "confirmed",
  "preparation_started",
  "team_dispatched",
  "setup_in_progress",
  "setup_completed",
  "event_completed",
  "cancelled",
];

export default function AdminDecorBookingsPage() {
  const [bookings, setBookings] = useState<DecorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        if (filter !== "all") params.append("status", filter);
        if (search) params.append("search", search);

        const res = await fetch(`/api/admin/decor-bookings?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setBookings(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, filter, search]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/decor-bookings?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setBookings(
          bookings.map((b) => (b.id === id ? { ...b, booking_status: status } : b))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      under_review: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      event_completed: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-luxury text-gold-primary">Decor Bookings</h1>
        <p className="text-text-secondary mt-1">Manage decoration bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-bg-card rounded-lg border border-border-custom p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Booking number or customer..."
            className="w-full md:w-96 px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setFilter("all");
            setPage(1);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all" ? "bg-gold-primary text-white" : "bg-bg-card border border-border-custom text-text-secondary"
          }`}
        >
          All
        </button>
        {["pending", "under_review", "quotation_sent", "confirmed", "event_completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status ? "bg-gold-primary text-white" : "bg-bg-card border border-border-custom text-text-secondary"
              }`}
            >
              {status.replace(/_/g, " ")}
            </button>
          )
        )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Booking</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Package</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Event</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gold-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{booking.booking_number}</p>
                          <p className="text-xs text-text-secondary">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-bg-secondary flex items-center justify-center">
                          <User className="w-5 h-5 text-text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{booking.user.full_name}</p>
                          <p className="text-xs text-text-secondary">{booking.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm text-text-primary">{booking.decor_package.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-primary">{booking.event_type.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-primary">
                        {new Date(booking.event_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-primary">
                        Rs. {Math.round(Number(booking.quoted_amount || booking.final_amount || 0)).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(booking.booking_status)}`}>
                          {booking.booking_status.replace(/_/g, " ")}
                        </span>
                        <select
                          value={booking.booking_status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="text-xs border border-border-custom rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-gold-primary"
                        >
                          {BOOKING_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
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

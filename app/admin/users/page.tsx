"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Mail, UserPlus, X } from "lucide-react";

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  _count?: {
    orders: number;
    bookings: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    role: "SHOP_MANAGER",
  });
  const [inviting, setInviting] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (search) params.append("search", search);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    if (!confirm(`Change user status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map((u) => (u.id === userId ? data.data : u)));
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteMessage("");
    setInviteError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();

      if (res.ok) {
        setInviteMessage(data.message || "User invited successfully");
        setInviteForm({ full_name: "", email: "", role: "SHOP_MANAGER" });
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteMessage("");
          fetchUsers();
        }, 1500);
      } else {
        setInviteError(data.error || "Failed to invite user");
      }
    } catch {
      setInviteError("An error occurred");
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800",
      CUSTOMER: "bg-blue-100 text-blue-800",
      SHOP_MANAGER: "bg-purple-100 text-purple-800",
      RIDER: "bg-green-100 text-green-800",
      DECOR_MANAGER: "bg-orange-100 text-orange-800",
      DECOR_STAFF: "bg-teal-100 text-teal-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      blocked: "bg-red-100 text-red-800",
      suspended: "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading && users.length === 0) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-luxury text-gold-primary">Users</h1>
          <p className="text-text-secondary mt-1">Manage user accounts and roles</p>
        </div>
        <button
          onClick={() => {
            setInviteMessage("");
            setInviteError("");
            setShowInviteModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Filters */}
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
              placeholder="Name or email..."
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            >
              <option value="all">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="SHOP_MANAGER">Shop Manager</option>
              <option value="RIDER">Rider</option>
              <option value="DECOR_MANAGER">Decor Manager</option>
              <option value="DECOR_STAFF">Decor Staff</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("all");
                setStatusFilter("all");
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-border-custom rounded-lg hover:bg-bg-secondary transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-secondary border-b border-border-custom">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Verified</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-text-primary">Orders</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-bg-secondary/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text-primary">{user.full_name}</p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-text-secondary">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-gold-primary ${getStatusBadge(user.status)}`}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {user.email_verified_at ? (
                        <span className="text-green-600 text-sm">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600 text-sm">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-primary font-medium">
                        {user._count?.orders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Total Users</p>
          <p className="text-2xl font-luxury text-gold-primary">{users.length}</p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Customers</p>
          <p className="text-2xl font-luxury text-blue-600">
            {users.filter((u) => u.role === "CUSTOMER").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Active</p>
          <p className="text-2xl font-luxury text-green-600">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Blocked</p>
          <p className="text-2xl font-luxury text-red-600">
            {users.filter((u) => u.status === "blocked").length}
          </p>
        </div>
        <div className="bg-bg-card border border-border-custom rounded-lg p-4">
          <p className="text-sm text-text-secondary">Staff</p>
          <p className="text-2xl font-luxury text-purple-600">
            {users.filter((u) => !["CUSTOMER"].includes(u.role)).length}
          </p>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-bg-card rounded-xl border border-border-custom w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-custom">
              <h2 className="text-xl font-luxury text-gold-primary">Add New User</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 text-text-secondary hover:bg-bg-secondary rounded-lg transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              {inviteMessage && (
                <div className="p-4 rounded-lg text-center text-sm bg-green-50 text-green-800 border border-green-200">
                  {inviteMessage}
                </div>
              )}
              {inviteError && (
                <div className="p-4 rounded-lg text-center text-sm bg-red-50 text-red-800 border border-red-200">
                  {inviteError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="e.g. Ali Khan"
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                >
                  <option value="SHOP_MANAGER">Shop Manager</option>
                  <option value="DECOR_MANAGER">Decor Manager</option>
                  <option value="DECOR_STAFF">Decor Staff</option>
                  <option value="RIDER">Rider</option>
                  <option value="ADMIN">Admin</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
                <p className="text-xs text-text-secondary mt-2">
                  An email with a one-time password setup link will be sent to this address.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-secondary transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="px-4 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {inviting ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
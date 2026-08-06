"use client";

import { useState, useEffect } from "react";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";

interface Review {
  id: number;
  kind: "product" | "decor";
  item_name: string;
  rating: number;
  description: string;
  status: string;
  admin_reply?: string | null;
  created_at: string;
  user: { full_name: string; email: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyingId, setReplyingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "20");
        if (search) params.append("search", search);
        if (filter !== "all") params.append("status", filter);

        const res = await fetch(`/api/admin/reviews?${params.toString()}`);
        const data = await res.json();
        if (!cancelled) {
          setReviews(data.data || []);
          setTotalPages(data.meta?.totalPages || 1);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, filter]);

  const handleApprove = async (review: Review) => {
    try {
      const res = await fetch(
        `/api/admin/reviews?id=${review.id}&kind=${review.kind}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved" }),
        }
      );

      if (res.ok) {
        setReviews(
          reviews.map((r) => (r.id === review.id ? { ...r, status: "approved" } : r))
        );
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  const handleSubmitReply = async (review: Review) => {
    const reply = (replyText[review.id] || "").trim();
    if (!reply) return;

    setReplyingId(review.id);
    try {
      const res = await fetch(
        `/api/admin/reviews?id=${review.id}&kind=${review.kind}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "approved", admin_reply: reply }),
        }
      );

      if (res.ok) {
        setReviews(
          reviews.map((r) =>
            r.id === review.id ? { ...r, admin_reply: reply, status: "approved" } : r
          )
        );
        setReplyText((prev) => ({ ...prev, [review.id]: "" }));
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setReplyingId(null);
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(
        `/api/admin/reviews?id=${review.id}&kind=${review.kind}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setReviews(reviews.filter((r) => r.id !== review.id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-bg-secondary rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-luxury text-gold-primary">Reviews</h1>
          <p className="text-text-secondary mt-1">Moderate product and decor reviews</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search reviews..."
          className="px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white w-64"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              filter === status
                ? "bg-gold-primary text-white"
                : "bg-bg-card border border-border-custom text-text-secondary"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-bg-card rounded-lg border border-border-custom p-12 text-center text-text-secondary">
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-bg-card rounded-lg border border-border-custom p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-gold-primary">
                      {review.kind === "product" ? "Product" : "Decor"} Review
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        review.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : review.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                  <p className="font-medium text-text-primary">{review.item_name}</p>
                  <p className="text-sm text-text-secondary">
                    {review.user.full_name} ({review.user.email})
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-gold-primary fill-gold-primary"
                            : "text-text-secondary"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-text-secondary ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-text-primary mt-3">{review.description}</p>

                  {review.admin_reply && (
                    <div className="mt-3 p-3 bg-bg-secondary rounded-lg">
                      <p className="text-xs font-medium text-gold-primary mb-1">Admin Reply</p>
                      <p className="text-sm text-text-primary">{review.admin_reply}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => handleApprove(review)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Reply box */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 relative">
                  <MessageSquare className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    value={replyText[review.id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                    }
                    placeholder="Write a reply..."
                    className="w-full pl-10 pr-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white text-sm"
                  />
                </div>
                <button
                  onClick={() => handleSubmitReply(review)}
                  disabled={replyingId === review.id}
                  className="px-4 py-2 bg-gold-primary text-white rounded-lg text-sm hover:bg-gold-dark transition disabled:opacity-50"
                >
                  {replyingId === review.id ? "Sending..." : "Reply"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="bg-bg-card rounded-lg border border-border-custom overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
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
        </div>
      )}
    </div>
  );
}

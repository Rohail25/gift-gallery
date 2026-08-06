import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for Pakistan Rupees
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format date in readable format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Generate sequential order number (e.g. ORD-0001)
 */
export function generateOrderNumber(seq: number): string {
  return `ORD-${String(seq).padStart(4, "0")}`;
}

/**
 * Generate unique booking number
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BKG-${timestamp}${random}`;
}

/**
 * Generate unique quotation number
 */
export function generateQuotationNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `QUO-${timestamp}${random}`;
}

/**
 * Create URL-friendly slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Calculate discount percentage
 */
export function getDiscountPercentage(
  regularPrice: number,
  salePrice: number
): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Handle API errors with proper response format
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      { status: 422 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}

/**
 * Validate if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === "string" ? new Date(date) : date;
  return d > new Date();
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Check if string is a valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is a valid phone number (Pakistan format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+92|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Safe parse JSON
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Get pagination metadata
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  };
}

/**
 * Calculate order status progress percentage
 */
export function getOrderStatusProgress(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 10,
    confirmed: 25,
    preparing: 40,
    ready_for_pickup: 55,
    assigned_to_rider: 65,
    picked_up: 75,
    on_the_way: 85,
    delivered: 100,
    cancelled: 0,
    returned: 0,
  };
  return statusMap[status] || 0;
}

/**
 * Calculate booking status progress percentage
 */
export function getBookingStatusProgress(status: string): number {
  const statusMap: Record<string, number> = {
    pending: 10,
    under_review: 20,
    site_visit_required: 30,
    site_visit_completed: 40,
    quotation_sent: 50,
    customer_approved: 60,
    confirmed: 70,
    preparation_started: 80,
    team_dispatched: 85,
    setup_in_progress: 90,
    setup_completed: 95,
    event_completed: 100,
    cancelled: 0,
  };
  return statusMap[status] || 0;
}

/**
 * Get order status badge color
 */
export function getOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    ready_for_pickup: "bg-indigo-100 text-indigo-800",
    assigned_to_rider: "bg-cyan-100 text-cyan-800",
    picked_up: "bg-teal-100 text-teal-800",
    on_the_way: "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get booking status badge color
 */
export function getBookingStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    under_review: "bg-blue-100 text-blue-800",
    site_visit_required: "bg-purple-100 text-purple-800",
    site_visit_completed: "bg-indigo-100 text-indigo-800",
    quotation_sent: "bg-cyan-100 text-cyan-800",
    customer_approved: "bg-teal-100 text-teal-800",
    confirmed: "bg-green-100 text-green-800",
    preparation_started: "bg-lime-100 text-lime-800",
    team_dispatched: "bg-emerald-100 text-emerald-800",
    setup_in_progress: "bg-orange-100 text-orange-800",
    setup_completed: "bg-green-100 text-green-800",
    event_completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}

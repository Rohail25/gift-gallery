"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccess(true);
        setMessage("If your email exists, a password reset OTP has been sent.");
      } else {
        setMessage(data.error || "Failed to send reset link");
      }
    } catch {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/auth/reset-password?email=${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-card p-8 rounded-xl shadow-lg border border-border-custom">
        <div>
          <h2 className="text-center text-3xl font-luxury text-gold-primary">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter your email to receive a password reset OTP
          </p>
        </div>

        {showSuccess ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-green-700">
              <p className="font-medium">Check your email!</p>
              <p className="text-sm mt-2">{message}</p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleContinue} size="lg" className="w-full">
                Continue to Reset Password
              </Button>
              <Link
                href="/auth/login"
                className="inline-flex justify-center py-3 px-4 text-sm font-medium text-text-primary hover:text-gold-primary transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div className="p-4 rounded-lg text-center text-sm bg-red-50 text-red-800 border border-red-200">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-border-custom placeholder-text-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent bg-white transition"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Sending OTP..." : "Send Reset OTP"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-text-secondary">Remember your password? </span>
              <Link href="/auth/login" className="font-medium text-gold-primary hover:text-gold-dark transition">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

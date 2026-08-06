"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/auth/forgot-password");
    }
  }, [email, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    const otpString = otp.join("");

    try {
      // First verify OTP
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "",
          otp: otpString,
          purpose: "forgot_password",
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setMessage(verifyData.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) (firstInput as HTMLInputElement).focus();
        setLoading(false);
        return;
      }

      // OTP verified, now reset password
      const resetRes = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "",
          password: password,
        }),
      });

      const resetData = await resetRes.json();

      if (resetRes.ok) {
        setSuccess(true);
        setMessage(resetData.message || "Password reset successfully!");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setMessage(resetData.error || "Password reset failed");
      }
    } catch {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-card p-8 rounded-xl shadow-lg border border-border-custom">
        <div>
          <h2 className="text-center text-3xl font-luxury text-gold-primary">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter the OTP from your email and create a new password
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-700 mb-4">{message}</p>
            <p className="text-text-secondary text-sm mb-4">Redirecting to login...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div
                className={`p-4 rounded-lg text-center text-sm ${
                  message.includes("successfully")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-text-primary mb-3 text-center">
                Enter OTP sent to <span className="font-medium">{email}</span>
              </label>
              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-2xl text-center border-2 border-border-custom rounded-lg focus:border-gold-primary focus:ring-2 focus:ring-gold-primary focus:outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                    New Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-border-custom placeholder-text-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent bg-white transition"
                    placeholder="Minimum 8 characters"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-border-custom placeholder-text-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent bg-white transition"
                    placeholder="Re-enter new password"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading || otp.join("").length !== 6 || !password || !confirmPassword}
                size="lg"
                className="w-full"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-text-secondary">Didn&apos;t receive OTP? </span>
              <Link
                href="/auth/forgot-password"
                className="font-medium text-gold-primary hover:text-gold-dark transition"
              >
                Resend OTP
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

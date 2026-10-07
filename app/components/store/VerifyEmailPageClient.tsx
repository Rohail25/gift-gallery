"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(60);
  const canResend = timer === 0;

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const otpString = otp.join("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || "",
          otp: otpString,
          purpose: "email_verification",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setMessage(data.error || "Verification failed");
        // Reset OTP on failure
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) (firstInput as HTMLInputElement).focus();
      }
    } catch {
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "User",
          email: email,
          password: "temporary",
          confirmPassword: "temporary",
        }),
      });

      if (res.ok) {
        setMessage("New OTP sent to your email!");
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        const firstInput = document.getElementById("otp-0");
        if (firstInput) (firstInput as HTMLInputElement).focus();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to resend OTP");
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
            Verify Email Address
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium text-text-primary">{email}</span>
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
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gold-primary hover:bg-gold-dark transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            {message && (
              <div
                className={`p-4 rounded-lg text-center text-sm ${
                  message.includes("sent") || message.includes("successfully")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <div className="flex justify-center gap-3">
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
                    className="w-14 h-14 text-3xl text-center border-2 border-border-custom rounded-lg focus:border-gold-primary focus:ring-2 focus:ring-gold-primary focus:outline-none transition"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                size="lg"
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <p className="text-text-secondary mb-2">
                Didn&apos;t receive the code?{" "}
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="font-medium text-gold-primary hover:text-gold-dark transition disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="font-medium text-gold-primary">
                    Resend in {timer}s
                  </span>
                )}
              </p>
              <p className="text-text-secondary">
                OTP is valid for 10 minutes
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-sm text-gold-primary hover:text-gold-dark transition"
              >
                Wrong email? Go back
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}

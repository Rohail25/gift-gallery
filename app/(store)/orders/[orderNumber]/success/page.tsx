"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  // Clear cart from local state after successful order
  useEffect(() => {
    // Trigger a custom event to update cart state in other components
    if (typeof window !== "undefined") {
      localStorage.removeItem("cartUpdated");
      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold-primary/15 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gold-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-luxury text-text-primary mb-4">
            Order Placed Successfully!
          </h1>

          <p className="text-text-secondary mb-2">
            Thank you for your order
          </p>

          <p className="text-gold-primary font-medium mb-8">
            Order #{orderNumber}
          </p>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6 mb-8">
            <h2 className="font-luxury text-text-primary mb-4">What happens next?</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-primary font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Order Confirmation</p>
                  <p className="text-sm text-text-secondary">
                    You will receive a confirmation email shortly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-primary font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Order Preparation</p>
                  <p className="text-sm text-text-secondary">
                    Our team will prepare your order with care
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-primary font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Delivery</p>
                  <p className="text-sm text-text-secondary">
                    A rider will deliver to your address with COD
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold-primary font-medium">4</span>
                </div>
                <div>
                  <p className="font-medium text-text-primary">Enjoy!</p>
                  <p className="text-sm text-text-secondary">
                    Receive and enjoy your premium gifts
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gold-primary text-gold-primary font-medium rounded-lg hover:bg-gold-primary hover:text-white transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
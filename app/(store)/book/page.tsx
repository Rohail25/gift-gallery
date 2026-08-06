"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface DecorPackage {
  id: number;
  name: string;
  starting_price: number;
  estimated_setup_hours: number;
  maximum_guests: number;
  service_city: string;
}

export default function BookDecorPage() {
  return (
    <Suspense fallback={null}>
      <BookDecorContent />
    </Suspense>
  );
}

function BookDecorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const packageId = searchParams.get("package");

  const [packageData, setPackageData] = useState<DecorPackage | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    event_date: "",
    event_start_time: "",
    event_end_time: "",
    guest_count: "",
    venue_type: "home",
    venue_name: "",
    theme_preferences: "",
    customer_notes: "",
    // Contact details
    contact_name: "",
    contact_phone: "",
    alternative_phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    area: "",
    postal_code: "",
    venue_instructions: "",
  });

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId) return;
      try {
        const res = await fetch(`/api/decor-packages/${packageId}`);
        if (res.ok) {
          const data = await res.json();
          setPackageData(data.data);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/book");
      return;
    }

    try {
      const res = await fetch("/api/decor-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/bookings/${data.data.booking_number}/confirmation`);
      } else {
        alert(data.error || "Failed to submit booking");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !packageData) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse h-8 bg-bg-card rounded w-1/4 mb-8"></div>
          <div className="bg-bg-card rounded-lg p-6 h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
              Reserve Your Date
            </p>
            <h1 className="text-4xl font-luxury text-text-primary mb-2">
              Book Your <span className="text-gold-primary italic">Event Decor</span>
            </h1>
            <p className="text-text-secondary">
              {packageData ? packageData.name : "Custom Event Decoration"}
            </p>
          </div>

          {/* Package Info Summary */}
          {packageData && (
            <div className="bg-bg-card rounded-xl border border-border-custom p-5 md:p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <Calendar className="w-8 h-8 text-gold-primary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Starts from</p>
                  <p className="font-medium text-gold-primary">
                    Rs. {Math.round(packageData.starting_price).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <Clock className="w-8 h-8 text-gold-primary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Setup Time</p>
                  <p className="font-medium text-text-primary">
                    {packageData.estimated_setup_hours} hours
                  </p>
                </div>
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <Users className="w-8 h-8 text-gold-primary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Max Guests</p>
                  <p className="font-medium text-text-primary">
                    {packageData.maximum_guests}
                  </p>
                </div>
                <div className="p-4 bg-bg-secondary rounded-lg">
                  <MapPin className="w-8 h-8 text-gold-primary mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Service Area</p>
                  <p className="font-medium text-text-primary">
                    {packageData.service_city}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="bg-bg-card rounded-xl border border-border-custom p-5 md:p-8">
            <div className="space-y-8">
              {/* Event Details */}
              <div>
                <h2 className="text-xl font-luxury text-text-primary mb-4">
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Estimated Guest Count *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.guest_count}
                      onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Enter number of guests"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.event_start_time}
                      onChange={(e) => setFormData({ ...formData, event_start_time: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={formData.event_end_time}
                      onChange={(e) => setFormData({ ...formData, event_end_time: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div>
                <h2 className="text-xl font-luxury text-text-primary mb-4">
                  Venue Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Venue Type *
                    </label>
                    <select
                      required
                      value={formData.venue_type}
                      onChange={(e) => setFormData({ ...formData, venue_type: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                    >
                      <option value="home">At Home</option>
                      <option value="hotel">Hotel Ballroom</option>
                      <option value="function_hall">Function Hall</option>
                      <option value="outdoor">Outdoor Venue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={formData.venue_name}
                      onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Enter venue name (if applicable)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address_line_1}
                      onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="City name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Area/neighborhood"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h2 className="text-xl font-luxury text-text-primary mb-4">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Alternative Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.alternative_phone}
                      onChange={(e) => setFormData({ ...formData, alternative_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Alternative contact number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="ZIP/Postal code"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Preferences */}
              <div>
                <h2 className="text-xl font-luxury text-text-primary mb-4">
                  Additional Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Theme Preferences (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.theme_preferences}
                      onChange={(e) => setFormData({ ...formData, theme_preferences: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Describe your preferred theme or color scheme..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Venue Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.venue_instructions}
                      onChange={(e) => setFormData({ ...formData, venue_instructions: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Parking details, access instructions, etc..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.customer_notes}
                      onChange={(e) => setFormData({ ...formData, customer_notes: e.target.value })}
                      className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      placeholder="Any other information..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full py-4"
                >
                  {loading ? "Submitting..." : "Submit Booking Request"}
                </Button>
                <p className="text-center text-sm text-text-secondary mt-4">
                  Our team will review your request and contact you shortly.
                </p>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              href="/decor"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gold-primary text-gold-primary font-medium rounded-lg hover:bg-gold-primary hover:text-white transition"
            >
              Back to Decor Packages
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
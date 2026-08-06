"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Check, Calendar, Users, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface DecorPackage {
  id: number;
  name: string;
  slug: string;
  package_code: string;
  starting_price: number;
  sale_price?: number;
  description: string;
  included_items: string[];
  excluded_items: string[];
  terms_and_conditions?: string;
  estimated_setup_hours: number;
  maximum_guests: number;
  service_city?: string;
  average_rating: number;
  reviews_count: number;
  images: Array<{ id: number; image_url: string; is_primary: boolean }>;
  decor_category: {
    name: string;
    slug: string;
    event_type: {
      name: string;
      slug: string;
    };
  };
}

export default function DecorPackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const [packageData, setPackageData] = useState<DecorPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetch(`/api/decor-packages/${slug}`);
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
  }, [slug]);

  const handleBookNow = () => {
    if (!session) {
      router.push("/auth/login?callbackUrl=/book");
      return;
    }
    router.push(`/book?package=${packageData!.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-bg-card rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="aspect-[4/3] bg-bg-card rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-bg-card rounded w-3/4"></div>
                <div className="h-6 bg-bg-card rounded w-1/2"></div>
                <div className="h-32 bg-bg-card rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-[60vh] bg-bg-primary flex items-center justify-center py-12">
        <div className="text-center">
          <h1 className="text-3xl font-luxury text-gold-primary mb-4">Package Not Found</h1>
          <Link
            href="/decor"
            className="inline-flex items-center justify-center px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
          >
            Browse Decor Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Breadcrumb */}
      <div className="bg-bg-secondary border-b border-border-custom">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gold-primary hover:text-gold-dark">Home</Link>
            <span className="text-text-secondary">/</span>
            <Link href="/decor" className="text-gold-primary hover:text-gold-dark">Decor</Link>
            <span className="text-text-secondary">/</span>
            <span className="text-text-primary">{packageData.name}</span>
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Images */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-bg-card border border-border-custom shadow-sm">
              {packageData.images[selectedImage] && (
                <Image
                  src={packageData.images[selectedImage].image_url}
                  alt={packageData.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>

            {packageData.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {packageData.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                      selectedImage === idx
                        ? "border-gold-primary"
                        : "border-border-custom hover:border-gold-primary"
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={`${packageData.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gold-primary font-medium">
                  {packageData.decor_category.event_type.name}
                </span>
                <span className="text-text-secondary">/</span>
                <span className="text-sm text-text-secondary">
                  {packageData.decor_category.name}
                </span>
              </div>
              <h1 className="text-3xl font-luxury text-text-primary mb-4">
                {packageData.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(packageData.average_rating)
                          ? "fill-gold-primary text-gold-primary"
                          : "text-border-custom"
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-text-secondary">
                  ({packageData.reviews_count} reviews)
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-bg-card border border-border-custom rounded-xl p-6">
              <p className="text-sm text-text-secondary mb-1">Starting Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-luxury text-gold-primary">
                  Rs. {Math.round(packageData.starting_price).toLocaleString()}
                </span>
                {packageData.sale_price && (
                  <span className="text-lg line-through text-text-secondary">
                    Rs. {Math.round(packageData.sale_price).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-2">
                Final price calculated after booking confirmation
              </p>
            </div>

            {/* Package Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gold-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Estimated Setup</p>
                  <p className="text-sm text-text-secondary">
                    {packageData.estimated_setup_hours} hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gold-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Maximum Guests</p>
                  <p className="text-sm text-text-secondary">
                    Up to {packageData.maximum_guests} guests
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold-primary" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">Service City</p>
                  <p className="text-sm text-text-secondary">
                    {packageData.service_city || "All cities"}
                  </p>
                </div>
              </div>
            </div>

            {/* Included Items */}
            <div className="bg-bg-card border border-border-custom rounded-xl p-6">
              <h3 className="font-luxury text-text-primary mb-4">What&apos;s Included</h3>
              <div className="space-y-2.5">
                {packageData.included_items.slice(0, 6).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-gold-primary" />
                    </span>
                    <span className="text-sm text-text-secondary">{item}</span>
                  </div>
                ))}
                {packageData.included_items.length > 6 && (
                  <p className="text-sm text-gold-primary mt-2">
                    + {packageData.included_items.length - 6} more items included
                  </p>
                )}
              </div>
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookNow}
              size="lg"
              className="w-full py-4 shadow-lg shadow-gold-primary/20"
            >
              Book This Decor
            </Button>
          </div>
        </div>

        {/* Full Description */}
        <div className="mt-10 md:mt-12 bg-bg-card border border-border-custom rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-luxury text-text-primary mb-6">About This Package</h2>
          <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
            {packageData.description}
          </div>
        </div>

        {/* Exclusions */}
        {packageData.excluded_items && packageData.excluded_items.length > 0 && (
          <div className="mt-6 bg-bg-card border border-border-custom rounded-xl p-6 md:p-8">
            <h3 className="font-luxury text-text-primary mb-4">What&apos;s Not Included</h3>
            <ul className="space-y-2">
              {packageData.excluded_items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-text-secondary">•</span>
                  <span className="text-sm text-text-secondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms */}
        {packageData.terms_and_conditions && (
          <div className="mt-6 bg-bg-card border border-border-custom rounded-xl p-6 md:p-8">
            <h3 className="font-luxury text-text-primary mb-4">Terms &amp; Conditions</h3>
            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
              {packageData.terms_and_conditions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
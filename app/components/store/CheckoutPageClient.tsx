"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, ShieldCheck } from "lucide-react";

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  area: string;
  postal_code?: string;
  is_default: boolean;
}

interface CartItem {
  id: number;
  quantity: number;
  line_total: number;
  product: {
    id: number;
    name: string;
    slug: string;
    images: Array<{ image_url: string }>;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface DeliveryZone {
  id: number;
  name: string;
  city: string;
  area: string;
  delivery_charge: number | string;
  minimum_order_amount: number | string;
  free_delivery_minimum?: number | string | null;
  estimated_min_minutes?: number | null;
  estimated_max_minutes?: number | null;
  is_active: boolean;
}

const toNumber = (v: number | string | null | undefined): number =>
  typeof v === "number" ? v : parseFloat(v || "0");

export function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // New address form state
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    area: "",
    postal_code: "",
    is_default: true,
  });
  const [, setAddressErrors] = useState<Record<string, string>>({});

  // Fetch cart and addresses
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

    const fetchData = async () => {
      try {
        const [cartRes, addressesRes, zonesRes] = await Promise.all([
          fetch("/api/cart"),
          fetch("/api/addresses"),
          fetch("/api/delivery-zones?active=true"),
        ]);

        const cartData = await cartRes.json();
        const addressesData = await addressesRes.json();
        const zonesData = await zonesRes.json();

        setCart(cartData.data);
        setAddresses(addressesData.data || []);
        setDeliveryZones(zonesData.data || []);

        // Auto-select default address
        const defaultAddress = addressesData.data?.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressErrors({});

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();

      if (res.ok) {
        setAddresses([...addresses, data.data]);
        setSelectedAddress(data.data.id);
        setShowNewAddressForm(false);
        setNewAddress({
          full_name: "",
          phone: "",
          address_line_1: "",
          address_line_2: "",
          city: "",
          area: "",
          postal_code: "",
          is_default: true,
        });
      } else {
        if (data.details) {
          setAddressErrors(data.details);
        }
      }
    } catch {
      setAddressErrors({ _error: "Failed to add address" });
    }
  };

  const selectedAddressObj =
    addresses.find((addr) => addr.id === selectedAddress) || null;

  const zoneForSelected = selectedAddressObj
    ? deliveryZones.find(
        (z) =>
          z.city.trim().toLowerCase() === selectedAddressObj.city.trim().toLowerCase() &&
          z.area.trim().toLowerCase() === selectedAddressObj.area.trim().toLowerCase()
      ) || null
    : deliveryZones.find((z) => z.id === selectedZoneId) || null;

  const subtotal = cart?.subtotal ?? 0;
  const belowMinimum =
    zoneForSelected && subtotal < toNumber(zoneForSelected.minimum_order_amount);
  const deliveryCharge = zoneForSelected
    ? zoneForSelected.free_delivery_minimum != null &&
      subtotal >= toNumber(zoneForSelected.free_delivery_minimum)
      ? 0
      : toNumber(zoneForSelected.delivery_charge)
    : null;
  const estimatedTotal =
    deliveryCharge === null ? subtotal : subtotal + deliveryCharge;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setMessage("Please select a delivery address");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerAddressId: selectedAddress,
          paymentMethod: "cod",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/orders/${data.data.order_number}/success`);
      } else {
        setMessage(data.error || "Failed to place order");
      }
    } catch {
      setMessage("An unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-luxury text-gold-primary mb-8">Checkout</h1>
          <div className="animate-pulse bg-bg-card rounded-lg border border-border-custom p-6">
            <div className="h-8 bg-bg-secondary rounded w-1/3 mb-6"></div>
            <div className="h-24 bg-bg-secondary rounded mb-4"></div>
            <div className="h-32 bg-bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-luxury text-gold-primary mb-8">Checkout</h1>
          <div className="text-center py-16 bg-bg-card rounded-lg border border-border-custom">
            <h2 className="text-2xl font-luxury text-text-primary mb-4">Your Cart is Empty</h2>
            <p className="text-text-secondary mb-8">Add some items to your cart to checkout.</p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-medium tracking-[0.2em] uppercase text-gold-primary mb-2">
          Almost There
        </p>
        <h1 className="text-4xl font-luxury text-text-primary mb-8">
          Secure <span className="text-gold-primary italic">Checkout</span>
        </h1>

        {message && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Address */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-luxury text-text-primary">Delivery Address</h2>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-gold-primary hover:text-gold-dark text-sm font-medium"
                  >
                    + Add New Address
                  </button>
                )}
              </div>

              {showNewAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-bg-secondary rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newAddress.full_name}
                        onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-primary mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={newAddress.address_line_1}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-text-primary mb-1">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={newAddress.address_line_2}
                        onChange={(e) => setNewAddress({ ...newAddress, address_line_2: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Area / Zone</label>
                      <select
                        value={selectedZoneId ?? ""}
                        onChange={(e) => {
                          const zoneId = e.target.value ? Number(e.target.value) : null;
                          const zone = deliveryZones.find((z) => z.id === zoneId) || null;
                          setSelectedZoneId(zoneId);
                          setNewAddress({
                            ...newAddress,
                            area: zone?.area ?? "",
                            city: zone?.city ?? newAddress.city,
                          });
                        }}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                        required
                      >
                        <option value="">Select your area</option>
                        {deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.area} - {zone.city}
                          </option>
                        ))}
                      </select>
                      {deliveryZones.length === 0 && (
                        <p className="text-xs text-rose-gold mt-1">
                          No delivery zones are currently available.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Postal Code (Optional)</label>
                      <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={newAddress.is_default}
                      onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                      className="rounded border-border-custom"
                    />
                    <label htmlFor="is_default" className="text-sm text-text-primary">Set as default address</label>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 border border-border-custom rounded-lg text-text-primary hover:bg-bg-card transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="space-y-3">
                {addresses.length === 0 && !showNewAddressForm ? (
                  <p className="text-text-secondary">No saved addresses. Please add a delivery address.</p>
                ) : (
                  addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex p-4 border rounded-lg cursor-pointer transition ${
                        selectedAddress === address.id
                          ? "border-gold-primary bg-gold-primary/5"
                          : "border-border-custom hover:border-gold-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddress === address.id}
                        onChange={() => setSelectedAddress(address.id)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text-primary">{address.full_name}</span>
                          {address.is_default && (
                            <span className="text-xs bg-gold-primary/10 text-gold-primary px-2 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{address.address_line_1}</p>
                        {address.address_line_2 && (
                          <p className="text-sm text-text-secondary">{address.address_line_2}</p>
                        )}
                        <p className="text-sm text-text-secondary">{address.area}, {address.city}</p>
                        <p className="text-sm text-text-secondary mt-1">{address.phone}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAddress === address.id
                          ? "border-gold-primary bg-gold-primary"
                          : "border-border-custom"
                      }`}>
                        {selectedAddress === address.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-bg-card rounded-lg border border-border-custom p-6">
              <h2 className="text-xl font-luxury text-text-primary mb-4">Payment Method</h2>
              <div className="p-4 border border-gold-primary bg-gold-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-gold-primary" />
                  <div>
                    <p className="font-medium text-text-primary">Cash on Delivery</p>
                    <p className="text-sm text-text-secondary">Pay when you receive your order</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-4">
                Secure and convenient payment options will be available soon.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-bg-card rounded-lg border border-border-custom p-6 sticky top-4">
              <h2 className="text-xl font-luxury text-text-primary mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {cart.items.map((item: CartItem) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-bg-secondary flex-shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={item.product.images[0].image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-primary text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{item.product.name}</p>
                      <p className="text-sm text-gold-primary">Rs. {Math.round(item.line_total).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border-custom pt-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium">Rs. {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Delivery</span>
                  {deliveryCharge === null ? (
                    <span className="text-sm text-rose-gold">Select area to calculate</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="text-sm text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">Rs. {Math.round(deliveryCharge).toLocaleString()}</span>
                  )}
                </div>
                {zoneForSelected && zoneForSelected.estimated_min_minutes != null && (
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Estimated delivery time</span>
                    <span>
                      {zoneForSelected.estimated_min_minutes}-
                      {zoneForSelected.estimated_max_minutes ?? zoneForSelected.estimated_min_minutes} min
                    </span>
                  </div>
                )}
                {zoneForSelected && zoneForSelected.free_delivery_minimum != null && (
                  <p className="text-xs text-text-secondary">
                    Free delivery on orders above Rs.{" "}
                    {Math.round(toNumber(zoneForSelected.free_delivery_minimum)).toLocaleString()}
                  </p>
                )}
              </div>

              {selectedAddress && deliveryCharge === null && (
                <p className="mt-4 text-sm text-rose-gold">
                  Delivery is not available for the selected area.
                </p>
              )}
              {selectedAddress && belowMinimum && (
                <p className="mt-4 text-sm text-rose-gold">
                  Minimum order amount for {zoneForSelected?.area} is Rs.{" "}
                  {Math.round(toNumber(zoneForSelected!.minimum_order_amount)).toLocaleString()}.
                </p>
              )}

              <div className="border-t border-border-custom pt-4 mt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-luxury text-text-primary">Estimated Total</span>
                  <span className="font-luxury text-gold-primary">
                    Rs. {Math.round(estimatedTotal).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={
                  processing || !selectedAddress || deliveryCharge === null || !!belowMinimum
                }
                className="w-full mt-6 py-3 px-4 bg-gold-primary text-white font-medium rounded-lg hover:bg-gold-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? "Processing..." : "Place Order (COD)"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
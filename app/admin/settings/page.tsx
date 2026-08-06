"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Store, Lock } from "lucide-react";

interface Setting {
  key: string;
  value?: string | null;
  group: string;
  label?: string | null;
}

const DEFAULT_KEYS: Array<{ key: string; label: string; group: string; is_public?: boolean }> = [
  { key: "store_name", label: "Store Name", group: "general", is_public: true },
  { key: "store_tagline", label: "Tagline", group: "general", is_public: true },
  { key: "store_email", label: "Support Email", group: "contact", is_public: true },
  { key: "store_phone", label: "Support Phone", group: "contact", is_public: true },
  { key: "store_address", label: "Store Address", group: "contact", is_public: true },
  { key: "whatsapp_number", label: "WhatsApp Number", group: "contact", is_public: true },
  { key: "facebook_url", label: "Facebook URL", group: "social", is_public: true },
  { key: "instagram_url", label: "Instagram URL", group: "social", is_public: true },
  { key: "tiktok_url", label: "TikTok URL", group: "social", is_public: true },
  { key: "free_delivery_threshold", label: "Free Delivery Threshold (PKR)", group: "shipping" },
  { key: "min_order_amount", label: "Minimum Order Amount (PKR)", group: "shipping" },
  { key: "cod_available", label: "Cash on Delivery Available (yes/no)", group: "shipping" },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        const list: Setting[] = data.data || [];

        const initial: Record<string, string> = {};
        for (const key of DEFAULT_KEYS) {
          initial[key.key] = list.find((s) => s.key === key.key)?.value || "";
        }

        if (!cancelled) {
          setSettings(list);
          setValues(initial);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");

    try {
      const payload = DEFAULT_KEYS.map((def) => ({
        key: def.key,
        label: def.label,
        group: def.group,
        value: values[def.key] || "",
        is_public: def.is_public ?? false,
      }));

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: payload }),
      });

      if (res.ok) {
        setSuccess("Settings saved successfully!");
        setTimeout(() => setSuccess(""), 2500);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save settings");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setChanging(true);
    setPasswordMessage(null);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage({ type: "success", text: data.message || "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "An error occurred" });
    } finally {
      setChanging(false);
    }
  };

  const groups = ["general", "contact", "social", "shipping"];
  const groupLabels: Record<string, string> = {
    general: "General",
    contact: "Contact Information",
    social: "Social Media",
    shipping: "Shipping & Delivery",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-bg-card rounded w-1/4 animate-pulse"></div>
        <div className="bg-bg-card rounded-lg border border-border-custom p-6">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-bg-secondary rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-luxury text-gold-primary">Settings</h1>
          <p className="text-text-secondary mt-1">Manage store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gold-primary text-white rounded-lg hover:bg-gold-dark transition disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {groups.map((group) => {
            const keys = DEFAULT_KEYS.filter((k) => k.group === group);
            return (
              <div key={group} className="bg-bg-card rounded-lg border border-border-custom p-6">
                <h2 className="text-xl font-luxury text-text-primary mb-4">
                  {groupLabels[group]}
                </h2>
                <div className="space-y-4">
                  {keys.map((def) => (
                    <div key={def.key}>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        {def.label}
                      </label>
                      <input
                        type="text"
                        value={values[def.key] || ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [def.key]: e.target.value }))
                        }
                        className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-gold-primary" />
              <h2 className="text-xl font-luxury text-text-primary">Change Password</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white"
                />
              </div>
              {passwordMessage && (
                <div
                  className={`p-3 text-sm rounded-lg ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}
              <button
                onClick={handleChangePassword}
                disabled={changing || !currentPassword || !newPassword || !confirmPassword}
                className="w-full py-2.5 bg-gold-primary text-white rounded-lg text-sm font-medium hover:bg-gold-dark transition disabled:opacity-50"
              >
                {changing ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>

          <div className="bg-bg-card rounded-lg border border-border-custom p-6">
            <div className="flex items-center gap-3 mb-4">
              <Store className="w-8 h-8 text-gold-primary" />
              <h2 className="text-xl font-luxury text-text-primary">Store Preview</h2>
            </div>
            <p className="text-sm text-text-secondary">
              Values saved here are available store-wide via the settings API. Contact and
              social details typically appear in the storefront footer and contact pages.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 w-full py-2 px-4 border border-gold-primary text-gold-primary rounded-lg text-sm font-medium hover:bg-gold-primary hover:text-white transition"
            >
              View Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

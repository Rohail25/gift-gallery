"use client";

import { useRef, useState } from "react";
import { Upload, ImageIcon, X, Loader2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "Image" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("An error occurred while uploading");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-24 h-24 rounded-lg border border-border-custom bg-bg-secondary overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-text-secondary" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-secondary border border-border-custom rounded-lg text-sm font-medium text-text-primary hover:bg-bg-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
            className="hidden"
            onChange={handleFile}
          />

          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Image URL"
              className="flex-1 px-4 py-2 border border-border-custom rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary bg-white text-sm"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                title="Remove image"
                className="px-3 py-2 border border-border-custom rounded-lg text-red-600 hover:bg-red-50 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-xs text-text-secondary">
            Files are stored locally in /public/uploads and saved as a /uploads/... URL.
          </p>
        </div>
      </div>
    </div>
  );
}

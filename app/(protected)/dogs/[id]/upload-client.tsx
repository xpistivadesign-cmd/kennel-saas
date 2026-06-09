"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  dogId: string;
  onUploaded: (url: string) => void;
};

export default function ImageUpload({
  userId,
  dogId,
  onUploaded,
}: Props) {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function resizeImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const maxSize = 1200;

        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas error");

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject("Compression failed");
            resolve(blob);
          },
          "image/jpeg",
          0.8
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function upload() {
    if (!file) return;

    setLoading(true);

    try {
      const resized = await resizeImage(file);

      const safeFileName = `${userId}/${dogId}-${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("dog-photos")
        .upload(safeFileName, resized, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (storageError) {
        console.error(storageError);
        alert("Upload failed");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from("dog-photos")
        .getPublicUrl(safeFileName);

      onUploaded(data.publicUrl);

      setLoading(false);
      setFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />

      <button
        onClick={upload}
        disabled={loading}
        className="px-4 py-2 rounded bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

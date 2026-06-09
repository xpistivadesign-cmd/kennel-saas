"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const max = 1200;

      let w = img.width;
      let h = img.height;

      if (w > h && w > max) {
        h = (h * max) / w;
        w = max;
      } else if (h > max) {
        w = (w * max) / h;
        h = max;
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => resolve(blob as Blob),
        "image/jpeg",
        0.8
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function DogClient({
  dogId,
  currentImage,
}: {
  dogId: string;
  currentImage?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function upload() {
    if (!file) return;

    setLoading(true);

    try {
      const blob = await resizeImage(file);

      const fileName = `${dogId}-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-photos").getPublicUrl(fileName);

      await supabase
        .from("dogs")
        .update({ image_url: publicUrl })
        .eq("id", dogId);

      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {currentImage && (
        <img
          src={currentImage}
          className="rounded-xl max-h-64 object-cover"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={upload}
        disabled={loading}
        className="px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

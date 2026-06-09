"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = document.createElement("img");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 1200;

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob as Blob);
        },
        "image/jpeg",
        0.8
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function DogClient({ dogId }: { dogId: string }) {
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
      const compressed = await resizeImage(file);

      const fileName = `${dogId}-${Date.now()}.jpg`;

      const { error } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, compressed, {
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
    <div className="mt-4 space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />

      <button
        onClick={upload}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

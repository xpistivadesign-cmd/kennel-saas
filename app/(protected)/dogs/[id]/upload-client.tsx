"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  dogId: string;
  onUploaded: (url: string) => Promise<void>;
};

export default function ImageUpload({
  userId,
  dogId,
  onUploaded,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");

          let width = img.width;
          let height = img.height;

          const MAX = 1200;

          if (width > height) {
            if (width > MAX) {
              height *= MAX / width;
              width = MAX;
            }
          } else {
            if (height > MAX) {
              width *= MAX / height;
              height = MAX;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas unavailable"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed"));
                return;
              }

              resolve(blob);
            },
            "image/jpeg",
            0.7
          );
        } catch (e) {
          reject(e);
        }
      };

      img.onerror = () => reject(new Error("Invalid image"));

      img.src = URL.createObjectURL(file);
    });
  }

  async function upload() {
    if (!file || loading) return;

    setLoading(true);

    try {
      let uploadBlob: Blob;

      if (file.size > 500_000) {
        uploadBlob = await compressImage(file);
      } else {
        uploadBlob = file;
      }

      const fileName =
        `${userId}/${dogId}-${Date.now()}.jpg`;

      const { error: storageError } =
        await supabase.storage
          .from("dog-photos")
          .upload(fileName, uploadBlob, {
            cacheControl: "3600",
            upsert: true,
            contentType: "image/jpeg",
          });

      if (storageError) {
        console.error(storageError);
        throw new Error(storageError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("dog-photos")
        .getPublicUrl(fileName);

      await onUploaded(publicUrl);

      setFile(null);

      router.refresh();

      alert("Image uploaded");
    } catch (error) {
      console.error(error);

      alert(
        "Feltöltési hiba: " +
          (error instanceof Error
            ? error.message
            : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setFile(e.target.files?.[0] ?? null)
        }
        className="block w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3"
      />

      <button
        type="button"
        onClick={upload}
        disabled={loading}
        className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DogProfileClient({
  dog,
  dogs,
}: {
  dog: any;
  dogs: any[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();

  async function resize(file: File) {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((r) => (img.onload = r));

    const canvas = document.createElement("canvas");

    let w = img.width;
    let h = img.height;

    if (w > 1200 || h > 1200) {
      if (w > h) {
        h = (h * 1200) / w;
        w = 1200;
      } else {
        w = (w * 1200) / h;
        h = 1200;
      }
    }

    canvas.width = w;
    canvas.height = h;

    canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.7);
    });
  }

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Select file");

    startUpload(async () => {
      try {
        const blob = await resize(file);

        const fileName = `${dog.id}-${Date.now()}.jpg`;

        const { error: upErr } = await supabase.storage
          .from("dog-photos")
          .upload(fileName, blob, {
            cacheControl: "3600",
            upsert: true,
          });

        if (upErr) throw upErr;

        const { data } = supabase.storage
          .from("dog-photos")
          .getPublicUrl(fileName);

        const url = data.publicUrl;

        const user = await supabase.auth.getUser();

        const { error: dbErr } = await supabase
          .from("dogs")
          .update({ image_url: url })
          .eq("id", dog.id)
          .eq("user_id", user.data.user?.id ?? "");

        if (dbErr) throw dbErr;

        router.refresh();
        alert("Uploaded!");
      } catch (e: any) {
        console.error(e);
        alert(e.message || "Upload failed");
      }
    });
  }

  return (
    <div className="p-8 text-white">
      {dog.image_url ? (
        <img
          src={dog.image_url}
          className="w-80 h-80 object-cover rounded-xl"
        />
      ) : (
        <div className="w-80 h-80 flex items-center justify-center bg-zinc-900 rounded-xl">
          No image
        </div>
      )}

      <input ref={fileRef} type="file" className="mt-4" />

      <button
        onClick={upload}
        disabled={uploading}
        className="mt-4 bg-amber-500 px-4 py-2 text-black rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

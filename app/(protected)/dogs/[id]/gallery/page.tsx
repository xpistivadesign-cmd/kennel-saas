"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Photo = {
  id: string;
  image_url: string;
};

export default function Gallery() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preview, setPreview] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("dog_photos")
      .select("id, image_url")
      .eq("dog_id", dogId)
      .order("created_at", { ascending: false });

    setPhotos(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [dogId]);

  async function upload(file: File) {
    const path = `${dogId}/${Date.now()}.${file.name.split(".").pop()}`;

    await supabase.storage.from("dog-photos").upload(path, file);

    const { data } = supabase.storage
      .from("dog-photos")
      .getPublicUrl(path);

    await supabase.from("dog_photos").insert({
      dog_id: dogId,
      image_url: data.publicUrl,
    });

    setPreview(null);
    load();
  }

  async function remove(id: string, url: string) {
    const path = url.split("dog-photos/")[1];

    if (path) {
      await supabase.storage.from("dog-photos").remove([path]);
    }

    await supabase.from("dog_photos").delete().eq("id", id);

    setPhotos((p) => p.filter((x) => x.id !== id));
  }

  if (loading) return <div style={c}>Loading...</div>;

  return (
    <div style={wrap}>
      <button onClick={() => router.back()} style={link}>
        ← Back
      </button>

      <h2>Gallery</h2>

      <div onClick={() => fileRef.current?.click()} style={drop}>
        Click or drop image

        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) =>
            e.target.files?.[0] && setPreview(e.target.files[0])
          }
        />
      </div>

      {preview && (
        <div style={card}>
          <img src={URL.createObjectURL(preview)} style={img} />

          <button onClick={() => upload(preview)} style={btn}>
            Upload
          </button>
        </div>
      )}

      <div style={grid}>
        {photos.map((p) => (
          <div key={p.id} style={{ position: "relative" }}>
            <img src={p.image_url} style={img} />

            <button
              onClick={() => remove(p.id, p.image_url)}
              style={del}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 900,
  margin: "40px auto",
  padding: 20,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
  gap: 10,
};

const img: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 8,
};

const drop: React.CSSProperties = {
  padding: 30,
  border: "2px dashed #ccc",
  margin: "20px 0",
  textAlign: "center",
  cursor: "pointer",
};

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #eee",
  marginBottom: 20,
};

const btn: React.CSSProperties = {
  marginTop: 10,
  padding: "8px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
};

const del: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "red",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const link: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0070f3",
  cursor: "pointer",
  fontWeight: "bold",
};

const c: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};
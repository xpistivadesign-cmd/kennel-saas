"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Photo = {
  id: string;
  image_url: string;
};

export default function DogGalleryPage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dogName, setDogName] = useState("Dog");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // -----------------------
  // LOAD DATA
  // -----------------------
  async function load() {
    if (!dogId) return;

    setLoading(true);

    const [{ data: dog }, { data: photos }] = await Promise.all([
      supabase.from("dogs").select("name").eq("id", dogId).single(),
      supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false }),
    ]);

    if (dog?.name) setDogName(dog.name);
    if (photos) setPhotos(photos);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [dogId]);

  // -----------------------
  // UPLOAD
  // -----------------------
  async function upload(file: File) {
    if (!dogId) return;

    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `${dogId}/${Date.now()}.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("dog-photos")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-photos").getPublicUrl(path);

      const { error: dbError } = await supabase
        .from("dog_photos")
        .insert({
          dog_id: dogId,
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      setPreviewFile(null);
      await load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // -----------------------
  // DELETE
  // -----------------------
  async function remove(photo: Photo) {
    if (!confirm("Delete this photo?")) return;

    const path = photo.image_url.split("dog-photos/")[1];

    if (path) {
      await supabase.storage.from("dog-photos").remove([path]);
    }

    await supabase.from("dog_photos").delete().eq("id", photo.id);

    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
  }

  // -----------------------
  // KEY NAV (MODAL)
  // -----------------------
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeIndex === null) return;

      if (e.key === "Escape") setActiveIndex(null);

      if (e.key === "ArrowRight") {
        setActiveIndex((i) =>
          i === null ? null : (i + 1) % photos.length
        );
      }

      if (e.key === "ArrowLeft") {
        setActiveIndex((i) =>
          i === null
            ? null
            : (i - 1 + photos.length) % photos.length
        );
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, photos.length]);

  // -----------------------
  // UI STATES
  // -----------------------
  if (loading) {
    return (
      <div style={center}>
        Loading gallery...
      </div>
    );
  }

  // -----------------------
  // UI
  // -----------------------
  return (
    <div style={wrap}>
      {/* HEADER */}
      <div style={header}>
        <button onClick={() => router.push(`/dogs/${dogId}`)} style={link}>
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>{dogName} Gallery</h2>
      </div>

      {/* DROPZONE */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);

          const file = e.dataTransfer.files?.[0];
          if (file) setPreviewFile(file);
        }}
        style={{
          ...dropzone,
          borderColor: dragActive ? "#0070f3" : "#ccc",
          background: dragActive ? "#f0f7ff" : "#fafafa",
        }}
      >
        Drag & Drop or Click to Upload

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreviewFile(file);
          }}
        />
      </div>

      {/* PREVIEW */}
      {previewFile && (
        <div style={card}>
          <img
            src={URL.createObjectURL(previewFile)}
            style={previewImg}
          />

          <div>
            <button
              onClick={() => upload(previewFile)}
              disabled={uploading}
              style={btnPrimary}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={() => setPreviewFile(null)}
              style={btnSecondary}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      <div style={grid}>
        {photos.map((p, i) => (
          <div key={p.id} style={imgWrap}>
            <img
              src={p.image_url}
              onClick={() => setActiveIndex(i)}
              style={img}
            />

            <button onClick={() => remove(p)} style={deleteBtn}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {activeIndex !== null && photos[activeIndex] && (
        <div
          onClick={() => setActiveIndex(null)}
          style={modal}
        >
          <img
            src={photos[activeIndex].image_url}
            style={modalImg}
          />
        </div>
      )}
    </div>
  );
}

// -----------------------
// STYLES (clean + stable)
// -----------------------
const wrap: React.CSSProperties = {
  maxWidth: 1000,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const link: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0070f3",
  cursor: "pointer",
  fontWeight: "bold",
};

const dropzone: React.CSSProperties = {
  marginTop: 20,
  padding: 40,
  borderRadius: 12,
  border: "2px dashed #ccc",
  textAlign: "center",
  cursor: "pointer",
};

const card: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
};

const previewImg: React.CSSProperties = {
  width: "100%",
  maxHeight: 300,
  objectFit: "cover",
  borderRadius: 8,
};

const grid: React.CSSProperties = {
  marginTop: 30,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 16,
};

const imgWrap: React.CSSProperties = {
  position: "relative",
  borderRadius: 10,
  overflow: "hidden",
};

const img: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "rgba(255,0,0,0.8)",
  color: "white",
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  cursor: "pointer",
};

const modal: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalImg: React.CSSProperties = {
  maxWidth: "90%",
  maxHeight: "90%",
  borderRadius: 10,
};

const center: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};

const btnPrimary: React.CSSProperties = {
  marginRight: 10,
  padding: "10px 16px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 16px",
  background: "#eee",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
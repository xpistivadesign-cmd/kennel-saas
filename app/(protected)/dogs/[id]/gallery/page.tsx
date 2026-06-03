"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

interface Photo {
  id: string;
  image_url: string;
}

export default function DogGalleryPage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dogName, setDogName] = useState("Dog");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // FULLSCREEN VIEWER
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // -------------------------
  // LOAD
  // -------------------------
  async function loadGallery() {
    if (!dogId) return;

    const { data: dog } = await supabase
      .from("dogs")
      .select("name")
      .eq("id", dogId)
      .single();

    if (dog) setDogName(dog.name);

    const { data } = await supabase
      .from("dog_photos")
      .select("id, image_url")
      .eq("dog_id", dogId)
      .order("created_at", { ascending: false });

    if (data) setPhotos(data);

    setLoading(false);
  }

  useEffect(() => {
    loadGallery();
  }, [dogId]);

  // -------------------------
  // UPLOAD
  // -------------------------
  async function uploadFile(file: File) {
    if (!dogId) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${dogId}/${Date.now()}.${fileExt}`;

    try {
      const { error } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-photos").getPublicUrl(fileName);

      await supabase.from("dog_photos").insert({
        dog_id: dogId,
        image_url: publicUrl,
      });

      setPreviewFile(null);
      await loadGallery();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // -------------------------
  // DELETE
  // -------------------------
  async function handleDelete(photoId: string, imageUrl: string) {
    if (!confirm("Delete this photo?")) return;

    const path = imageUrl.split("dog-photos/")[1];

    if (path) {
      await supabase.storage.from("dog-photos").remove([path]);
    }

    await supabase.from("dog_photos").delete().eq("id", photoId);

    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  // -------------------------
  // DRAG & DROP
  // -------------------------
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) setPreviewFile(file);
  }

  // -------------------------
  // KEYBOARD NAV (MODAL)
  // -------------------------
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (activeIndex === null) return;

      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight")
        setActiveIndex((prev) =>
          prev === null ? null : (prev + 1) % photos.length
        );
      if (e.key === "ArrowLeft")
        setActiveIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + photos.length) % photos.length
        );
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, photos.length]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Loading gallery...
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "40px auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={() => router.push(`/dogs/${dogId}`)}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <h2 style={{ margin: 0 }}>📸 {dogName} Gallery</h2>
      </div>

      {/* DROPZONE */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        style={{
          marginTop: 30,
          padding: 40,
          borderRadius: 12,
          border: dragActive
            ? "2px solid #0070f3"
            : "2px dashed #ccc",
          textAlign: "center",
          background: dragActive ? "#f0f7ff" : "#fafafa",
          cursor: "pointer",
        }}
      >
        Drag & Drop or Click to Upload
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files?.[0] &&
            setPreviewFile(e.target.files[0])
          }
        />
      </div>

      {/* PREVIEW */}
      {previewFile && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #eee",
            borderRadius: 12,
          }}
        >
          <img
            src={URL.createObjectURL(previewFile)}
            style={{
              width: "100%",
              maxHeight: 300,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => uploadFile(previewFile)}
              disabled={uploading}
              style={{
                padding: "10px 16px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                marginRight: 10,
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            <button
              onClick={() => setPreviewFile(null)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: 8,
                background: "#eee",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {photos.map((p, i) => (
          <div
            key={p.id}
            style={{
              position: "relative",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            <img
              src={p.image_url}
              onClick={() => setActiveIndex(i)}
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
              }}
            />

            <button
              onClick={() =>
                handleDelete(p.id, p.image_url)
              }
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(255,0,0,0.8)",
                color: "white",
                border: "none",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* FULLSCREEN MODAL */}
      {activeIndex !== null && photos[activeIndex] && (
        <div
          onClick={() => setActiveIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <img
            src={photos[activeIndex].image_url}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 10,
            }}
          />
        </div>
      )}
    </div>
  );
}
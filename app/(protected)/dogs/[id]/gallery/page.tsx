"use client";

import { useState, useEffect, useRef } from "react";
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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // LOAD DATA
  // ----------------------------
  async function loadGallery() {
    if (!dogId) return;

    try {
      const { data: dogData } = await supabase
        .from("dogs")
        .select("name")
        .eq("id", dogId)
        .single();

      if (dogData) setDogName(dogData.name);

      const { data: photosData } = await supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false });

      if (photosData) setPhotos(photosData);
    } catch (err) {
      console.error("Error loading gallery:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, [dogId]);

  // ----------------------------
  // FILE SELECT
  // ----------------------------
  function handleFile(file: File) {
    setPreviewFile(file);
  }

  // ----------------------------
  // UPLOAD TO SUPABASE
  // ----------------------------
  async function uploadFile(file: File) {
    if (!dogId) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${dogId}/${Date.now()}.${fileExt}`;

    try {
      // 1. upload storage
      const { error: uploadError } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. public url
      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-photos").getPublicUrl(fileName);

      // 3. db insert
      const { error: dbError } = await supabase
        .from("dog_photos")
        .insert({
          dog_id: dogId,
          image_url: publicUrl,
        });

      if (dbError) throw dbError;

      setPreviewFile(null);
      await loadGallery();
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  // ----------------------------
  // DELETE PHOTO
  // ----------------------------
  async function handleDelete(photoId: string, imageUrl: string) {
    if (!confirm("Delete this photo?")) return;

    try {
      const pathParts = imageUrl.split("dog-photos/");
      const storagePath = pathParts[1];

      if (storagePath) {
        await supabase.storage
          .from("dog-photos")
          .remove([storagePath]);
      }

      const { error } = await supabase
        .from("dog_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  }

  // ----------------------------
  // DRAG & DROP HANDLERS
  // ----------------------------
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // ----------------------------
  // UI STATES
  // ----------------------------
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
        Loading gallery...
      </div>
    );
  }

  // ----------------------------
  // MAIN UI
  // ----------------------------
  return (
    <div
      style={{
        maxWidth: 900,
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
          ← Back to Profile
        </button>

        <h2 style={{ margin: 0 }}>📸 {dogName}'s Gallery</h2>
      </div>

      {/* DROPZONE */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          marginTop: 30,
          padding: 40,
          borderRadius: 12,
          border: dragActive
            ? "2px solid #0070f3"
            : "2px dashed #ccc",
          background: dragActive ? "#f0f7ff" : "#fafafa",
          textAlign: "center",
          cursor: "pointer",
          transition: "0.2s",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: "bold" }}>
          Drag & Drop images here or click to upload
        </p>
        <p style={{ fontSize: 12, color: "#888" }}>
          JPG / PNG supported
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* PREVIEW UPLOAD */}
      {previewFile && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <p style={{ fontWeight: "bold" }}>Preview:</p>

          <img
            src={URL.createObjectURL(previewFile)}
            alt="preview"
            style={{
              width: "100%",
              maxHeight: 300,
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

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
              fontWeight: "bold",
            }}
          >
            {uploading ? "Uploading..." : "Upload Photo"}
          </button>

          <button
            onClick={() => setPreviewFile(null)}
            style={{
              marginLeft: 10,
              padding: "10px 16px",
              background: "#eee",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* GALLERY GRID */}
      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {photos.map((photo) => (
          <div
            key={photo.id}
            style={{
              position: "relative",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid #eee",
            }}
          >
            <img
              src={photo.image_url}
              alt="dog"
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
              }}
            />

            <button
              onClick={() =>
                handleDelete(photo.id, photo.image_url)
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
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function DogGalleryPage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dogName, setDogName] = useState("Dog");
  const [photos, setPhotos] = useState<{ id: string; image_url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, [dogId]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0 || !dogId) return;

    setUploading(true);
    const file = e.target.files[0];

    const fileExt = file.name.split(".").pop();
    const fileName = `${dogId}/${Date.now()}.${fileExt}`;

    try {
      // 1. Upload Storage-be
      const { error: uploadError } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-photos").getPublicUrl(fileName);

      // 3. DB insert
      const { error: dbError } = await supabase.from("dog_photos").insert({
        dog_id: dogId,
        image_url: publicUrl,
      });

      if (dbError) throw dbError;

      await loadGallery();
      alert("Photo uploaded successfully!");
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string, imageUrl: string) {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const pathParts = imageUrl.split("dog-photos/");
      const storagePath = pathParts[1];

      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from("dog-photos")
          .remove([storagePath]);

        if (storageError) {
          console.error("Storage delete error:", storageError);
        }
      }

      const { error: dbError } = await supabase
        .from("dog_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      alert("Photo deleted!");
    } catch (error: any) {
      alert("Delete failed: " + error.message);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        Loading Gallery...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={() => router.push(`/dogs/${dogId}`)}
        style={{
          background: "none",
          border: "none",
          color: "#0070f3",
          cursor: "pointer",
          marginBottom: 20,
          fontWeight: "bold",
        }}
      >
        ← Back to Profile
      </button>

      <h1 style={{ marginBottom: 10 }}>📸 {dogName}'s Photo Gallery</h1>
      <p style={{ color: "#666", marginBottom: 30 }}>
        Manage and upload photos for this dog.
      </p>

      {/* Upload */}
      <div
        style={{
          border: "2px dashed #ccc",
          borderRadius: 8,
          padding: 30,
          textAlign: "center",
          background: "#f9f9f9",
          marginBottom: 40,
        }}
      >
        <label
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            color: "#0070f3",
          }}
        >
          {uploading ? "Uploading..." : "➕ Click here to upload a photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>

        <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
          Supports JPG, PNG (Max 5MB)
        </p>
      </div>

      {/* Gallery */}
      <h3>Photos ({photos.length})</h3>

      {photos.length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#999",
            border: "1px dashed #eee",
            borderRadius: 6,
          }}
        >
          No photos uploaded yet. Use the box above to add the first one!
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
            marginTop: 20,
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: "relative",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #eee",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Image
                src={photo.image_url}
                alt="Dog photo"
                width={300}
                height={150}
                style={{
                  width: "100%",
                  height: 150,
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
                  borderRadius: 4,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
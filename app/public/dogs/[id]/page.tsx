"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Photo = {
  id: string;
  image_url: string;
};

type Dog = {
  id: string;
  name: string;
  sex?: string | null;
};

export default function PublicDogProfile() {
  const params = useParams();
  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<Dog | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // LOAD PUBLIC DATA
  // -------------------------
  async function load() {
    if (!dogId) return;

    setLoading(true);

    try {
      // DOG BASIC INFO (NO AUTH CHECK)
      const { data: dogData } = await supabase
        .from("dogs")
        .select("id, name, sex")
        .eq("id", dogId)
        .single();

      if (!dogData) {
        setLoading(false);
        return;
      }

      setDog(dogData);

      // PHOTOS (PUBLIC READ ENABLED RLS REQUIRED!)
      const { data: photoData } = await supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false });

      setPhotos(photoData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [dogId]);

  // -------------------------
  // UI STATES
  // -------------------------
  if (loading) {
    return (
      <div style={center}>
        Loading public profile...
      </div>
    );
  }

  if (!dog) {
    return (
      <div style={center}>
        <h2>🐶 Dog not found</h2>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={wrap}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={{ margin: 0 }}>🐶 {dog.name}</h1>

        <p style={{ color: "#666" }}>
          {dog.sex === "female"
            ? "Female"
            : dog.sex === "male"
            ? "Male"
            : "Unknown"}
        </p>
      </div>

      {/* HERO */}
      <div style={hero}>
        <h2 style={{ marginBottom: 10 }}>
          Meet {dog.name}
        </h2>

        <p style={{ color: "#555" }}>
          This is the official public profile page.
        </p>
      </div>

      {/* GALLERY */}
      <h3 style={{ marginTop: 30 }}>📸 Gallery</h3>

      {photos.length === 0 ? (
        <p style={{ color: "#999" }}>
          No photos available.
        </p>
      ) : (
        <div style={grid}>
          {photos.map((p) => (
            <img
              key={p.id}
              src={p.image_url}
              style={img}
              alt="dog"
            />
          ))}
        </div>
      )}

      {/* SHARE HINT */}
      <div style={footer}>
        Share this page with future owners 💌
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 900,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const hero: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  borderRadius: 12,
  background: "#f6f8fa",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 10,
};

const img: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 10,
};

const footer: React.CSSProperties = {
  marginTop: 40,
  padding: 20,
  textAlign: "center",
  color: "#666",
  borderTop: "1px solid #eee",
};

const center: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};
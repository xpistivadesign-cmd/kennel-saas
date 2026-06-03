"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Photo = {
  id: string;
  image_url: string;
};

type Dog = {
  id: string;
  name: string;
  sex?: string | null;
};

export default function DogProfilePage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<Dog | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -------------------------
  // LOAD PROFILE (SECURE)
  // -------------------------
  async function load() {
    if (!dogId) return;

    setLoading(true);

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      if (!user) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      // SECURITY: owner check in query
      const { data: dogData, error: dogError } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", dogId)
        .eq("user_id", user.id)
        .single();

      if (dogError || !dogData) {
        setError("Dog not found or access denied.");
        setLoading(false);
        return;
      }

      setDog(dogData);

      const { data: photoData } = await supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false })
        .limit(3);

      setPhotos(photoData || []);
    } catch (e) {
      setError("Unexpected error.");
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
    return <div style={center}>Loading profile...</div>;
  }

  if (error || !dog) {
    return (
      <div style={center}>
        <h2 style={{ color: "red" }}>Access denied</h2>
        <p>{error}</p>

        <button onClick={() => router.push("/")} style={btn}>
          Back
        </button>
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
        <button onClick={() => router.push("/")} style={link}>
          ← Dashboard
        </button>

        <button
          onClick={() => router.push(`/dogs/${dogId}/edit`)}
          style={btnSecondary}
        >
          Edit
        </button>
      </div>

      {/* DOG CARD */}
      <div style={card}>
        <h1 style={{ margin: 0 }}>🐶 {dog.name}</h1>

        <p style={{ color: "#666" }}>
          Gender:{" "}
          <b>
            {dog.sex === "female"
              ? "Female"
              : dog.sex === "male"
              ? "Male"
              : "Unknown"}
          </b>
        </p>
      </div>

      {/* GALLERY PREVIEW */}
      <div style={card}>
        <div style={row}>
          <h3>📸 Recent photos</h3>

          <button
            onClick={() => router.push(`/dogs/${dogId}/gallery`)}
            style={btn}
          >
            Open gallery →
          </button>
        </div>

        {photos.length === 0 ? (
          <p style={{ color: "#999" }}>No photos yet</p>
        ) : (
          <div style={grid}>
            {photos.map((p) => (
              <img key={p.id} src={p.image_url} style={img} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 800,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const card: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  marginTop: 10,
};

const img: React.CSSProperties = {
  width: "100%",
  height: 120,
  objectFit: "cover",
  borderRadius: 8,
};

const center: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};

const btn: React.CSSProperties = {
  padding: "8px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  padding: "8px 14px",
  background: "#eee",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const link: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#0070f3",
  fontWeight: "bold",
  cursor: "pointer",
};
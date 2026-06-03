"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type DogPhoto = {
  id: string;
  image_url: string;
};

const centerStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: 40,
  fontFamily: "sans-serif",
  color: "#666",
};

export default function PublicDogPage() {
  const params = useParams();
  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<any>(null);
  const [photos, setPhotos] = useState<DogPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!dogId) return;

      try {
        // 1. kutya lekérés (csak public)
        const { data: dogData, error: dogError } = await supabase
          .from("dogs")
          .select("*")
          .eq("id", dogId)
          .eq("is_public", true)
          .single();

        if (dogError || !dogData) {
          setError("This dog profile is not available.");
          setLoading(false);
          return;
        }

        setDog(dogData);

        // 2. képek
        const { data: photoData } = await supabase
          .from("dog_photos")
          .select("id, image_url")
          .eq("dog_id", dogId)
          .order("created_at", { ascending: false })
          .limit(6);

        setPhotos(photoData || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [dogId]);

  if (loading) {
    return <div style={centerStyle}>Loading kennel profile...</div>;
  }

  if (error) {
    return <div style={centerStyle}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>{dog.name}</h1>
        <p style={{ color: "#666" }}>
          {dog.breed || "Breed not specified"} •{" "}
          {dog.sex === "female" ? "Female" : "Male"}
        </p>
      </div>

      {/* MAIN IMAGE GRID */}
      {photos.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#999", border: "1px dashed #ddd" }}>
          No photos available.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {photos.map((p) => (
            <div
              key={p.id}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #eee",
                height: 180,
              }}
            >
              <img
                src={p.image_url}
                alt="dog"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: 40, textAlign: "center", color: "#aaa", fontSize: 12 }}>
        Verified kennel profile
      </div>
    </div>
  );
}
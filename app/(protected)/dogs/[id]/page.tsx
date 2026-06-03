"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface Photo {
  id: string;
  image_url: string;
}

export default function DogProfilePage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<any>(null);
  const [latestPhotos, setLatestPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadDogProfile() {
      if (!dogId) return;

      try {
        // 1. Auth user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setErrorMsg("You must be logged in to view this profile.");
          setLoading(false);
          return;
        }

        // 2. Dog fetch (secure)
        const { data: dogData, error: dogError } = await supabase
          .from("dogs")
          .select("*")
          .eq("id", dogId)
          .eq("user_id", user.id)
          .single();

        if (dogError || !dogData) {
          setErrorMsg("Dog profile not found or access denied.");
          setLoading(false);
          return;
        }

        setDog(dogData);

        // 3. Latest photos (preview)
        const { data: photosData } = await supabase
          .from("dog_photos")
          .select("id, image_url")
          .eq("dog_id", dogId)
          .order("created_at", { ascending: false })
          .limit(3);

        if (photosData) {
          setLatestPhotos(photosData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setErrorMsg("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadDogProfile();
  }, [dogId]);

  if (loading) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "sans-serif",
          textAlign: "center",
          color: "#666",
        }}
      >
        Loading secure profile...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div
        style={{
          maxWidth: 500,
          margin: "60px auto",
          padding: 20,
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h2 style={{ color: "#ff4d4f" }}>⚠️ Access Error</h2>
        <p style={{ color: "#666", marginTop: 10 }}>{errorMsg}</p>

        <button
          onClick={() => router.push("/")}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      {/* NAV */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← Dashboard
        </button>

        <button
          onClick={() => router.push(`/dogs/${dogId}/edit`)}
          style={{
            padding: "8px 16px",
            background: "#f0f0f0",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ⚙️ Edit Details
        </button>
      </div>

      {/* DOG CARD */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e4e8",
          borderRadius: 12,
          padding: 30,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 40 }}>🐶</span>

          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>
              {dog?.name ?? "Unknown Dog"}
            </h1>

            <p style={{ margin: "4px 0 0 0", color: "#666" }}>
              Gender:{" "}
              <strong>
                {dog?.sex
                  ? dog.sex === "female"
                    ? "Female (Szuka)"
                    : "Male (Kan)"
                  : "Unknown"}
              </strong>
            </p>
          </div>
        </div>
      </div>

      {/* GALLERY PREVIEW */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e4e8",
          borderRadius: 12,
          padding: 30,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0 }}>📸 Recent Photos</h3>

          <button
            onClick={() => router.push(`/dogs/${dogId}/gallery`)}
            style={{
              padding: "8px 14px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            Open Photo Gallery →
          </button>
        </div>

        {/* EMPTY STATE */}
        {latestPhotos.length === 0 ? (
          <div
            style={{
              padding: "30px 0",
              textAlign: "center",
              color: "#999",
              border: "1px dashed #eee",
              borderRadius: 8,
            }}
          >
            No photos uploaded yet for {dog?.name}. Add some in the gallery.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {latestPhotos.map((photo) => (
              <div
                key={photo.id}
                style={{
                  height: 120,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: "1px solid #eee",
                  position: "relative",
                }}
              >
                <Image
                  src={photo.image_url}
                  alt="Dog preview"
                  width={300}
                  height={120}
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
      </div>
    </div>
  );
}
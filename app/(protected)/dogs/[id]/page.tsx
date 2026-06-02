"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Dog = {
  id: string;
  name: string;
  sex: "male" | "female";
  status: "active" | "deceased";
};

type DogImage = {
  id: string;
  image_url: string;
};

export default function DogProfilePage({ params }: { params: { id: string } }) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [images, setImages] = useState<DogImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const router = useRouter();
  const dogId = params.id;

  useEffect(() => {
    loadDog();
    loadImages();
  }, [dogId]);

  async function loadDog() {
    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", dogId)
      .maybeSingle();

    if (error || !data) {
      alert("Kutya nem található 🐶");
      router.push("/");
      return;
    }

    setDog(data);
  }

  async function loadImages() {
    const { data } = await supabase
      .from("dog_images")
      .select("*")
      .eq("dog_id", dogId)
      .order("created_at", { ascending: false });

    setImages(data || []);
    setLoading(false);
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);

      const fileName = `${dogId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("dog-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("dog-images")
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("dog_images")
        .insert({
          dog_id: dogId,
          image_url: data.publicUrl,
        });

      if (dbError) throw dbError;

      await loadImages();
      e.target.value = "";
    } catch (error: any) {
      alert("Hiba: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Betöltés...</h3>
      </div>
    );
  }

  if (!dog) return null;

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <button onClick={() => router.push("/")} style={{ marginBottom: 20 }}>
        ⬅️ Vissza
      </button>

      <h1>🐕 {dog.name}</h1>

      <p>
        <b>Nem:</b> {dog.sex === "male" ? "Kan" : "Szuka"}
      </p>

      <p>
        {dog.status === "active" ? (
          <span style={{ color: "green", fontWeight: "bold" }}>🟢 Él</span>
        ) : (
          <span style={{ color: "gray", fontWeight: "bold" }}>⚫ Elhunyt</span>
        )}
      </p>

      <button
        onClick={() => router.push(`/dogs/${dog.id}/edit`)}
        style={{
          padding: "10px 14px",
          background: "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: 10,
        }}
      >
        ✏️ Szerkesztés
      </button>

      <hr style={{ margin: "20px 0" }} />

      <h2>📸 Galéria</h2>

      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={handleUpload}
      />

      {uploading && <p>Feltöltés...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          marginTop: 20,
        }}
      >
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        ))}
      </div>

    </div>
  );
}

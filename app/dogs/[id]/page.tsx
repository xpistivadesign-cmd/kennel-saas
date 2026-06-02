"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Dog = {
  id: string;
  name: string;
  sex: "male" | "female";
};

export default function DogProfilePage({ params }: { params: { id: string } }) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const dogId = params.id;

  useEffect(() => {
    loadDog();
  }, [dogId]);

  async function loadDog() {
    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", dogId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert("Kutya nem található 🐶");
        router.push("/");
        return;
      }

      setDog(data);
    } catch (error: any) {
      console.error(error);
      alert("Hiba a kutya betöltésekor: " + error.message);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Kutya profil betöltése...</h3>
      </div>
    );
  }

  if (!dog) return null;

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: 20, cursor: "pointer", padding: "8px 12px" }}
      >
        ⬅️ Vissza
      </button>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h1 style={{ marginBottom: 10 }}>🐕 {dog.name}</h1>

        <p>
          <b>Nem:</b>{" "}
          {dog.sex === "male" ? "Kan (Male)" : "Szuka (Female)"}
        </p>

        <p>
          <b>ID:</b> {dog.id}
        </p>

        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <button
            onClick={() => router.push(`/dogs/${dog.id}/edit`)}
            style={{
              padding: "10px 14px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✏️ Szerkesztés
          </button>

          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 14px",
              background: "#eee",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

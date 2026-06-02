"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";

type Kennel = {
  id: string;
  name: string;
  description: string;
  website: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
};

type Dog = {
  id: string;
  name: string;
  sex: "male" | "female";
  status: "active" | "deceased";
};

export default function KennelPublicPage({ params }: { params: { id: string } }) {
  const [kennel, setKennel] = useState<Kennel | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const kennelId = params.id;

  useEffect(() => {
    loadKennel();
    loadDogs();
  }, [kennelId]);

  async function loadKennel() {
    const { data } = await supabase
      .from("kennels")
      .select("*")
      .eq("id", kennelId)
      .maybeSingle();

    setKennel(data || null);
  }

  async function loadDogs() {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("kennel_id", kennelId);

    setDogs(data || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Kenel betöltése...</h3>
      </div>
    );
  }

  if (!kennel) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>❌ Kennel nem található</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        background: kennel.secondary_color || "#fff",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: kennel.primary_color,
          color: "white",
          padding: 30,
          textAlign: "center",
        }}
      >
        {kennel.logo_url && (
          <img
            src={kennel.logo_url}
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: 10,
            }}
          />
        )}

        <h1>{kennel.name}</h1>
        <p>{kennel.description}</p>
      </div>

      {/* DOG LIST */}
      <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
        <h2>🐕 Kutyák</h2>

        {dogs.length === 0 && <p>Nincs kutya feltöltve.</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 15,
            marginTop: 20,
          }}
        >
          {dogs.map((dog) => (
            <div
              key={dog.id}
              style={{
                padding: 15,
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "white",
              }}
            >
              <h3>{dog.name}</h3>

              <p>
                {dog.sex === "male" ? "♂ Kan" : "♀ Szuka"}
              </p>

              <p>
                {dog.status === "active" ? (
                  <span style={{ color: "green" }}>🟢 Él</span>
                ) : (
                  <span style={{ color: "gray" }}>⚫ Elhunyt</span>
                )}
              </p>

              <button
                onClick={() => router.push(`/dogs/${dog.id}`)}
                style={{
                  marginTop: 10,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Megnézem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

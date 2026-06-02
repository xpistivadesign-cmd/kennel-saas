"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

type Stats = {
  totalDogs: number;
  activeDogs: number;
  deceasedDogs: number;
  totalImages: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDogs: 0,
    activeDogs: 0,
    deceasedDogs: 0,
    totalImages: 0,
  });

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: dogs } = await supabase.from("dogs").select("id, status");
      const { data: images } = await supabase.from("dog_images").select("id");

      const totalDogs = dogs?.length || 0;
      const activeDogs = dogs?.filter((d) => d.status === "active").length || 0;
      const deceasedDogs = dogs?.filter((d) => d.status === "deceased").length || 0;
      const totalImages = images?.length || 0;

      setStats({
        totalDogs,
        activeDogs,
        deceasedDogs,
        totalImages,
      });
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Dashboard betöltése...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 900, margin: "0 auto" }}>
      
      <h1>🐶 Kennel Dashboard</h1>
      <p style={{ color: "#666" }}>Áttekintés a teljes állományról</p>

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 15,
          marginTop: 20,
        }}
      >
        <div style={card}>
          <h2>🐕 {stats.totalDogs}</h2>
          <p>Összes kutya</p>
        </div>

        <div style={card}>
          <h2 style={{ color: "green" }}>🟢 {stats.activeDogs}</h2>
          <p>Élő kutyák</p>
        </div>

        <div style={card}>
          <h2 style={{ color: "gray" }}>⚫ {stats.deceasedDogs}</h2>
          <p>Elhunyt kutyák</p>
        </div>

        <div style={card}>
          <h2>📸 {stats.totalImages}</h2>
          <p>Képek összesen</p>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ marginTop: 30 }}>
        <h2>⚡ Gyors műveletek</h2>

        <button
          onClick={() => router.push("/dogs/new")}
          style={button}
        >
          ➕ Új kutya hozzáadása
        </button>

        <button
          onClick={() => router.push("/settings")}
          style={{ ...button, marginLeft: 10, background: "#555" }}
        >
          ⚙️ Kennel beállítások
        </button>
      </div>

    </div>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  borderRadius: 10,
  border: "1px solid #ddd",
  textAlign: "center",
  background: "#fff",
};

const button: React.CSSProperties = {
  padding: "12px 16px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  marginTop: 10,
};

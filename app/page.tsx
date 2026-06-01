"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/app/login");
    } else {
      setUser(user);
      await loadDogs();
    }
    setLoading(false);
  }

  async function loadDogs() {
    const { data } = await supabase
      .from("dogs")
      .select(`*, dog_images (image_url)`);
    setDogs(data || []);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/app/login");
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}><h3>Rendszer betöltése...</h3></div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #eee", paddingBottom: 10, marginBottom: 20 }}>
        <h1>🐶 Guerrero de las Montanas Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>👤 {user?.email}</span>
          <button onClick={handleLogout} style={{ background: "#333", color: "white", border: "none", padding: "8px 15px", borderRadius: 4, cursor: "pointer" }}>
            Kijelentkezés
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 30 }}>
        <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f8f9fa" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#555" }}>🐶 Összes kutya</h4>
          <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{dogs.length}</p>
        </div>
      </div>
      <p>A rendszer készen áll a használatra.</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [dogs, setDogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Átirányítás a belső mappádra, ami most fixen létezik a GitHubodon!
      router.push("/app/register");
    } else {
      setUser(user);
      await loadDogs();
    }
    setLoading(false);
  }

  async function loadDogs() {
    const { data } = await supabase.from("dogs").select("*");
    setDogs(data || []);
  }

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}><h3>Betöltés...</h3></div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <h1>🐶 Guerrero de las Montanas Dashboard</h1>
      <p>Sikeresen bent vagy! Felhasználó: {user?.email}</p>
      <div style={{ border: "1px solid #ccc", padding: 20, borderRadius: 8, background: "#f8f9fa", width: 200 }}>
        <h4>🐶 Összes kutya</h4>
        <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>{dogs.length}</p>
      </div>
    </div>
  );
}

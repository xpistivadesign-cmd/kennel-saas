"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const KENNEL_ID = "6fa0a2f1-b7a4-413b-8910-af33cebcd633";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        await supabase.from("profiles").insert({
          id: authData.user.id,
          kennel_id: KENNEL_ID,
          full_name: fullName,
          role: "owner"
        });

        alert("Sikeres regisztráció! Most már bejelentkezhetsz!");
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8, fontFamily: "sans-serif" }}>
      <h2>📝 Regisztráció a Kennelbe</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>Teljes név:</label>
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: 8 }} />

        <label>E-mail cím:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: 8 }} />

        <label>Jelszó:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: 8 }} />

        <button type="submit" disabled={loading} style={{ padding: 10, background: "#28a745", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "Regisztráció..." : "Fiók létrehozása"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, FormEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      alert("Sikeres bejelentkezés! 🎉");
      router.push("/");
    } catch (err: any) {
      console.error("Bejelentkezési hiba részletei:", err);
      setError(err?.message || "Ismeretlen hiba történt a belépés során.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 20, border: "1px solid #ccc", borderRadius: 8, fontFamily: "sans-serif" }}>
      <h2>🔑 Bejelentkezés</h2>
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label>E-mail cím:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: 8 }} />

        <label>Jelszó:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: 8 }} />

        <button type="submit" disabled={loading} style={{ padding: 10, background: "#0070f3", color: "white", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
          {loading ? "Belépés..." : "Bejelentkezés"}
        </button>
      </form>
      
      <p style={{ marginTop: 15, fontSize: "0.9rem" }}>
        Nincs még fiókod? <span style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/register")}>Regisztrálj itt</span>
      </p>
    </div>
  );
}

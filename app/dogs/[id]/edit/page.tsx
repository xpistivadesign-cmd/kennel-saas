"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

type Sex = "male" | "female";
type Status = "active" | "deceased";

export default function DogEditPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("female");
  const [status, setStatus] = useState<Status>("active");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      setName(data.name || "");
      setSex(data.sex || "female");
      setStatus(data.status || "active");
    } catch (error: any) {
      console.error(error);
      alert("Hiba a kutya betöltésekor: " + error.message);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("dogs")
        .update({
          name,
          sex,
          status,
        })
        .eq("id", dogId);

      if (error) throw error;

      alert("Kutya sikeresen frissítve 🐶");
      await loadDog();
    } catch (error: any) {
      console.error(error);
      alert("Mentési hiba: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Kutya betöltése...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: 20, padding: "8px 12px", cursor: "pointer" }}
      >
        ⬅️ Vissza
      </button>

      <h1>🐕 Kutya szerkesztése</h1>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>
        
        <div>
          <label style={{ fontWeight: "bold", marginBottom: 5, display: "block" }}>
            Név
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label style={{ fontWeight: "bold", marginBottom: 5, display: "block" }}>
            Nem
          </label>
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="female">Szuka</option>
            <option value="male">Kan</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: "bold", marginBottom: 5, display: "block" }}>
            Státusz
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="active">🟢 Él</option>
            <option value="deceased">⚫ Elhunyt</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 10,
            padding: 12,
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {saving ? "Mentés..." : "Mentés 💾"}
        </button>

      </form>
    </div>
  );
}

"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "next/navigation";

type Sex = "male" | "female";

export default function DogEditPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState("");
  const [sex, setSex] = useState<Sex>("female");

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
        })
        .eq("id", dogId);

      if (error) throw error;

      alert("Kutya sikeresen frissítve 🐶");

      // UX: nem azonnal kidob, hanem stabil visszatöltés
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
        <h3>Kutya adatainak betöltése...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: 20, cursor: "pointer", padding: "8px 12px" }}
      >
        ⬅️ Vissza a Dashboardra
      </button>

      <h1>🐕 Kutya szerkesztése</h1>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}
      >

        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
            Név:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: 5 }}>
            Nem:
          </label>

          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as Sex)}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          >
            <option value="female">Szuka (Female)</option>
            <option value="male">Kan (Male)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "12px",
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
            marginTop: 10,
          }}
        >
          {saving ? "Mentés..." : "Adatok mentése 💾"}
        </button>

      </form>
    </div>
  );
}

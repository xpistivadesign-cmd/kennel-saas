"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewDogPage() {
  const [name, setName] = useState("");
  const [sex, setSex] = useState("female");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Add meg a kutya nevét!");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Nem vagy bejelentkezve.");
        return;
      }

      const { error } = await supabase.from("dogs").insert({
        name,
        sex,
        user_id: user.id,
      });

      if (error) throw error;

      alert("Kutya sikeresen létrehozva!");

      router.push("/");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <h1>🐶 Új kutya hozzáadása</h1>

      <form
        onSubmit={handleCreate}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
        }}
      >
        <label>
          Név
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 4,
            }}
          />
        </label>

        <label>
          Nem
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 4,
            }}
          >
            <option value="female">Szuka</option>
            <option value="male">Kan</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {loading ? "Mentés..." : "Kutya létrehozása"}
        </button>
      </form>
    </div>
  );
}
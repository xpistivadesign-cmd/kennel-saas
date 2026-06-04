"use client";

import { useEffect, useState } from "react";
import { getDogs, saveDog, Dog } from "@/lib/supabase/dogs";

export default function DogClient() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [form, setForm] = useState<Dog>({
    name: "",
    breed: "",
    gender: "male",
    sire_id: "",
    dam_id: "",
  });

  useEffect(() => {
    loadDogs();
  }, []);

  async function loadDogs() {
    const data = await getDogs();
    setDogs(data);
  }

  function males() {
    return dogs.filter((d) => d.gender === "male");
  }

  function females() {
    return dogs.filter((d) => d.gender === "female");
  }

  async function handleSubmit() {
    const res = await saveDog(form);
    if (res.success) {
      setForm({
        name: "",
        breed: "",
        gender: "male",
        sire_id: "",
        dam_id: "",
      });
      loadDogs();
    }
  }

  return (
    <div className="p-4 space-y-4">

      <h2 className="text-xl font-bold">🐶 Új kutya</h2>

      {/* NAME */}
      <input
        placeholder="Név"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border p-2 w-full"
      />

      {/* BREED */}
      <input
        placeholder="Fajta"
        value={form.breed}
        onChange={(e) => setForm({ ...form, breed: e.target.value })}
        className="border p-2 w-full"
      />

      {/* GENDER */}
      <select
        value={form.gender}
        onChange={(e) =>
          setForm({ ...form, gender: e.target.value as "male" | "female" })
        }
        className="border p-2 w-full"
      >
        <option value="male">Kan</option>
        <option value="female">Szuka</option>
      </select>

      {/* 🧬 SIRE (APA) */}
      <select
        value={form.sire_id || ""}
        onChange={(e) => setForm({ ...form, sire_id: e.target.value })}
        className="border p-2 w-full"
      >
        <option value="">-- Apa kiválasztása --</option>
        {males().map((dog) => (
          <option key={dog.id} value={dog.id}>
            {dog.name}
          </option>
        ))}
      </select>

      {/* 🧬 DAM (ANYA) */}
      <select
        value={form.dam_id || ""}
        onChange={(e) => setForm({ ...form, dam_id: e.target.value })}
        className="border p-2 w-full"
      >
        <option value="">-- Anya kiválasztása --</option>
        {females().map((dog) => (
          <option key={dog.id} value={dog.id}>
            {dog.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2"
      >
        Mentés
      </button>
    </div>
  );
}

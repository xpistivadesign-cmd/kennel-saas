"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Dog = {
  id: string;
  name: string;
  breed: string | null;
  chip_number: string | null;
  created_at?: string;
};

export default function DogClient({
  initialDogs,
}: {
  initialDogs: Dog[];
}) {
  const supabase = createClient();

  const [dogs, setDogs] = useState<Dog[]>(initialDogs);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    breed: "",
    chip_number: "",
  });

  // ➕ Új kutya létrehozás
  const addDog = async () => {
    if (!form.name) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("dogs")
      .insert([
        {
          name: form.name,
          breed: form.breed || null,
          chip_number: form.chip_number || null,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Hiba a mentés során");
      return;
    }

    if (data) {
      setDogs([data, ...dogs]);
      setForm({ name: "", breed: "", chip_number: "" });
    }
  };

  // 🗑️ Kutya törlés
  const deleteDog = async (id: string) => {
    const confirm = window.confirm("Biztosan törlöd ezt a kutyát?");
    if (!confirm) return;

    const { error } = await supabase.from("dogs").delete().eq("id", id);

    if (error) {
      alert("Törlési hiba");
      return;
    }

    setDogs(dogs.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ➕ FORM */}
      <div className="bg-white border rounded-xl p-4 space-y-3">
        <h2 className="font-bold text-sm text-gray-700">
          ➕ Új kutya hozzáadása
        </h2>

        <div className="grid md:grid-cols-3 gap-2">
          <input
            className="border p-2 rounded"
            placeholder="Név"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Fajta"
            value={form.breed}
            onChange={(e) =>
              setForm({ ...form, breed: e.target.value })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Chip szám"
            value={form.chip_number}
            onChange={(e) =>
              setForm({ ...form, chip_number: e.target.value })
            }
          />
        </div>

        <button
          onClick={addDog}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-80"
        >
          {loading ? "Mentés..." : "Kutya hozzáadása"}
        </button>
      </div>

      {/* 🐕 LISTA */}
      <div className="grid md:grid-cols-2 gap-4">
        {dogs.length === 0 ? (
          <p className="text-gray-500">Nincs kutya a rendszerben</p>
        ) : (
          dogs.map((dog) => (
            <div
              key={dog.id}
              className="border rounded-xl p-4 bg-white space-y-2"
            >
              <div className="flex justify-between">
                <div className="font-bold">{dog.name}</div>
                <button
                  onClick={() => deleteDog(dog.id)}
                  className="text-red-500 text-xs"
                >
                  Törlés
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Fajta: {dog.breed || "-"}
              </div>

              <div className="text-xs text-gray-500">
                Chip: {dog.chip_number || "-"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
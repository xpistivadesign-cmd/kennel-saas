"use client";

import { useState } from "react";
import { saveDog, deleteDog, Dog } from "@/lib/supabase/dogs.client";

export default function DogClient({ initialDogs }: { initialDogs: Dog[] }) {
  const [dogs, setDogs] = useState(initialDogs);
  const [loading, setLoading] = useState(false);

  async function handleSave(dog: Dog) {
    setLoading(true);

    const res = await saveDog(dog);

    if (res.success && res.data) {
      setDogs((prev) => {
        const exists = prev.find((d) => d.id === res.data.id);
        if (exists) {
          return prev.map((d) => (d.id === res.data.id ? res.data : d));
        }
        return [res.data, ...prev];
      });
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    setLoading(true);

    const ok = await deleteDog(id);

    if (ok) {
      setDogs((prev) => prev.filter((d) => d.id !== id));
    }

    setLoading(false);
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">🐶 Dogs</h1>

      {loading && <p>Loading...</p>}

      <ul className="mt-4 space-y-2">
        {dogs.map((dog) => (
          <li key={dog.id} className="border p-2 rounded">
            <div className="flex justify-between">
              <span>
                {dog.name} ({dog.breed})
              </span>

              <button
                onClick={() => handleDelete(dog.id!)}
                className="text-red-500"
              >
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

type Dog = {
  id: string;
  name: string;
  breed: string;
  microchip?: string;
};

export default function DogClient() {
  const supabase = createClient();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDogs = async () => {
      const { data, error } = await supabase.from("dogs").select("*");

      if (error) {
        console.error("Dogs load error:", error.message);
        return;
      }

      setDogs(data || []);
      setLoading(false);
    };

    fetchDogs();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Betöltés...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">🐕 Kutyák</h1>

      {dogs.length === 0 ? (
        <p className="text-gray-500">Nincs még kutya a rendszerben.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="p-4 bg-white border rounded-xl space-y-1"
            >
              <p className="font-bold">{dog.name}</p>
              <p className="text-sm text-gray-500">{dog.breed}</p>
              <p className="text-xs text-gray-400 font-mono">
                {dog.microchip || "Nincs chip"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

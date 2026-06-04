"use client";

import { useState } from "react";
import { Dog, saveDog, deleteDog } from "@/lib/supabase/dogs";

interface DogClientProps {
  initialDogs: Dog[];
}

const EMPTY_DOG: Dog = {
  name: "",
  breed: "",
  gender: "female",
  reg_number: "",
  birth_date: "",
};

export default function DogClient({ initialDogs }: DogClientProps) {
  const [dogs, setDogs] = useState<Dog[]>(initialDogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Dog>(EMPTY_DOG);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!formData.name.trim() || !formData.breed.trim()) {
      alert("A név és a fajta kötelező.");
      return;
    }

    setLoading(true);

    const result = await saveDog(formData);

    setLoading(false);

    if (!result.success || !result.data) {
      alert(result.error ?? "Sikertelen mentés.");
      return;
    }

    setDogs((prev) => [result.data as Dog, ...prev]);

    setFormData(EMPTY_DOG);
    setIsModalOpen(false);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Biztosan törölni szeretnéd ezt a kutyát?"
    );

    if (!confirmed) {
      return;
    }

    const success = await deleteDog(id);

    if (!success) {
      alert("A törlés nem sikerült.");
      return;
    }

    setDogs((prev) => prev.filter((dog) => dog.id !== id));
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          🐕 Kutyák kezelése
        </h1>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700"
        >
          + Új kutya
        </button>
      </div>

      {dogs.length === 0 ? (
        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">
            Még nincs kutya regisztrálva.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-bold">
                  {dog.name}
                </h3>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    dog.gender === "male"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-pink-100 text-pink-800"
                  }`}
                >
                  {dog.gender === "male" ? "Kan" : "Szuka"}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  <strong>Fajta:</strong> {dog.breed}
                </p>

                {dog.reg_number && (
                  <p>
                    <strong>Törzskönyv:</strong>{" "}
                    {dog.reg_number}
                  </p>
                )}

                {dog.birth_date && (
                  <p>
                    <strong>Született:</strong>{" "}
                    {dog.birth_date}
                  </p>
                )}
              </div>

              <div className="mt-4 border-t pt-3 text-right">
                <button
                  type="button"
                  onClick={() =>
                    dog.id && handleDelete(dog.id)
                  }
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold">
              Új kutya
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Név *
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Fajta *
                </label>

                <input
                  type="text"
                  required
                  value={formData.breed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      breed: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nem
                </label>

                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target
                        .value as Dog["gender"],
                    })
                  }
                  className="w-full rounded-lg border p-2"
                >
                  <option value="female">
                    Szuka
                  </option>
                  <option value="male">
                    Kan
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Törzskönyvi szám
                </label>

                <input
                  type="text"
                  value={formData.reg_number ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reg_number: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Születési dátum
                </label>

                <input
                  type="date"
                  value={formData.birth_date ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      birth_date: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border p-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="rounded-lg bg-gray-100 px-4 py-2"
                >
                  Mégse
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                >
                  {loading
                    ? "Mentés..."
                    : "Mentés"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

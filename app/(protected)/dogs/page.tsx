import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("id, name, registration_number, image_url");

  if (error || !dogs) {
    return (
      <div className="p-6 text-red-500">
        Hiba a kutyák betöltésekor.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        🐕 Tenyészállatok
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dogs.map((dog) => (
          <Link
            key={dog.id}
            href={`/dogs/${dog.id}`}
            className="bg-white shadow rounded p-4 hover:shadow-lg transition"
          >
            {dog.image_url && (
              <img
                src={dog.image_url}
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            <h2 className="font-bold text-lg">{dog.name}</h2>

            <p className="text-sm text-gray-500">
              {dog.registration_number ?? "Nincs törzskönyv"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
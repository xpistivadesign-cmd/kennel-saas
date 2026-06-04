import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

interface DogPageProps {
  params: {
    id: string;
  };
}

export default async function DogPage({ params }: DogPageProps) {
  const { id } = params;

  const supabase = await createClient();

  // 🐕 Kutya lekérése (stabil, single record)
  const { data: dog, error } = await supabase
    .from("dogs")
    .select("id, name, registration_number, birth_date, sex")
    .eq("id", id)
    .single();

  if (error || !dog) {
    return notFound();
  }

  // 🧬 Tenyésztési előzmények
  const { data: heats } = await supabase
    .from("heats")
    .select("id, start_date, end_date")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">
          🐕 {dog.name}
        </h1>

        <Link
          href="/dogs"
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Vissza
        </Link>
      </div>

      {/* DOG INFO */}
      <div className="bg-white border rounded p-5 space-y-2">
        <p>
          <strong>Törzskönyv:</strong>{" "}
          {dog.registration_number ?? "-"}
        </p>

        <p>
          <strong>Nem:</strong>{" "}
          {dog.sex === "female"
            ? "Szuka"
            : dog.sex === "male"
            ? "Kan"
            : "-"}
        </p>

        <p>
          <strong>Születési dátum:</strong>{" "}
          {dog.birth_date
            ? new Date(dog.birth_date).toLocaleDateString("hu-HU")
            : "-"}
        </p>
      </div>

      {/* BREEDING HISTORY */}
      <div className="bg-white border rounded p-5">
        <h2 className="font-bold mb-3">
          🧬 Tenyésztési előzmények
        </h2>

        {!heats || heats.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Nincs rögzített adat.
          </p>
        ) : (
          <div className="space-y-2">
            {heats.map((h) => (
              <div
                key={h.id}
                className="flex justify-between border-b py-2 text-sm"
              >
                <span>
                  📅 {new Date(h.start_date).toLocaleDateString("hu-HU")}
                  {" → "}
                  {h.end_date
                    ? new Date(h.end_date).toLocaleDateString("hu-HU")
                    : "folyamatban"}
                </span>

                <span className="text-xs text-gray-500">
                  {h.end_date ? "lezárva" : "aktív"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
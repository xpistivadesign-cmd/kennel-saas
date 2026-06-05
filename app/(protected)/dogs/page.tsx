import Link from "next/link";
import DogClient from "./ui/DogClient";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DogsPage() {
  const supabase = createServerSupabase();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*");

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">🐶 Dogs</h1>

      <div className="grid gap-2">
        {(dogs ?? []).map((dog) => (
          <Link
            key={dog.id}
            href={`/dogs/${dog.id}`}
            className="border p-3 rounded hover:bg-gray-50"
          >
            <div className="font-medium">{dog.name}</div>
            <div className="text-xs text-gray-500">
              {dog.breed}
            </div>
          </Link>
        ))}
      </div>

      <DogClient initialDogs={dogs ?? []} />
    </div>
  );
}

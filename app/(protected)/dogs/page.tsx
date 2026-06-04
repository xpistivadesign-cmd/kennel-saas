import { createClient } from "@/utils/supabase/server";
import DogClient from "./ui/DogClient";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Hiba történt a kutyák betöltésekor.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🐕 Kutyák kezelése</h1>

      <DogClient initialDogs={dogs || []} />
    </div>
  );
}
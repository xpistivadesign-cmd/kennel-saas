export const dynamic = "force-dynamic";

import DogClient from "./ui/DogClient";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DogsPage() {
  const supabase = createServerSupabase();

  const { data: dogs, error } = await supabase.from("dogs").select("*");

  if (error) {
    console.error(error);
  }

  return <DogClient initialDogs={dogs ?? []} />;
}

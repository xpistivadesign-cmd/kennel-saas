export const dynamic = "force-dynamic";

import DogClient from "./ui/DogClient";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DogsPage() {
  const supabase = createServerSupabase();

  const { data: dogs } = await supabase.from("dogs").select("*");

  return <DogClient initialDogs={dogs ?? []} />;
}

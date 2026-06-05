import DogListClient from "@/components/dogs/DogListClient";
import { createClient } from "@/lib/supabase/server";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*");

  return <DogListClient dogs={dogs ?? []} />;
}

import DogDetailClient from "@/components/dogs/DogDetailClient";
import { createClient } from "@/lib/supabase/server";

export default async function DogPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", params.id)
    .single();

  return <DogDetailClient dog={dog} />;
}

import { createClient } from "@/utils/supabase/server";
import DogProfileClient from "./ui/DogProfileClient";

export default async function DogProfilePage({
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

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", params.id);

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("dog_id", params.id);

  const { data: health } = await supabase
    .from("health_tests")
    .select("*")
    .eq("dog_id", params.id);

  return (
    <DogProfileClient
      dog={dog}
      heats={heats || []}
      payments={payments || []}
      health={health || []}
    />
  );
}
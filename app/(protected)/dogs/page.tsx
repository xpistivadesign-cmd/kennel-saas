import DogClient from "./ui/DogClient";
import { createServerSupabase } from "@/lib/supabase/server";

export type Dog = {
  id: string;
  name: string;
  breed?: string;
  created_at?: string;
};

export default async function DogsPage() {
  const supabase = createServerSupabase();

  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("*");

  if (error) {
    console.error("Failed to fetch dogs:", error.message);
  }

  return <DogClient dogs={(dogs as Dog[]) ?? []} />;
}

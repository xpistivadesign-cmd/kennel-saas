import DogClient from "./ui/DogClient";
import { createServerSupabase } from "@/lib/supabase/server";

export interface Dog {
  id: string;
  name: string;
  breed?: string;
  created_at?: string;
}

export default async function DogsPage() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("dogs")
    .select("*");

  if (error) {
    console.error("Dogs fetch error:", error.message);
  }

  return <DogClient dogs={(data as Dog[]) ?? []} />;
}

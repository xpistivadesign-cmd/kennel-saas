import { createClient } from "./client";

export interface Dog {
  id?: string;
  name: string;
  breed?: string;
  created_at?: string;
}

const supabase = createClient();

/**
 * Client-side CRUD helpers
 */

export async function getDogsClient(): Promise<Dog[]> {
  const { data, error } = await supabase
    .from("dogs")
    .select("*");

  if (error) {
    console.error("getDogsClient error:", error.message);
    return [];
  }

  return (data as Dog[]) ?? [];
}

export async function deleteDog(id: string) {
  const { error } = await supabase
    .from("dogs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteDog error:", error.message);
    throw error;
  }
}

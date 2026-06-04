import { createClient } from "./client";

export interface Dog {
  id?: string;
  name: string;
  breed?: string;
  age?: number;
}

const supabase = createClient();

export async function saveDog(dog: Dog) {
  const { data, error } = await supabase
    .from("dogs")
    .insert(dog)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDog(id: string) {
  const { error } = await supabase
    .from("dogs")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

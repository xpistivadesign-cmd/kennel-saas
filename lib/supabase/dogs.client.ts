import { supabase } from "./client";

export interface Dog {
  id?: string;
  name: string;
  reg_number?: string;
  birth_date?: string;
  breed: string;
  gender: "male" | "female";
  owner_id?: string;
  sire_id?: string;
  dam_id?: string;
}

export async function saveDog(dog: Dog) {
  if (dog.id) {
    return supabase.from("dogs").update(dog).eq("id", dog.id);
  }

  return supabase.from("dogs").insert([dog]);
}

export async function deleteDog(id: string) {
  const { error } = await supabase.from("dogs").delete().eq("id", id);
  return !error;
}

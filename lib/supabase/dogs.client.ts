import { createClient } from "./client";

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

// 💾 SAVE (INSERT / UPDATE)
export async function saveDog(dogData: Dog) {
  const supabase = createClient();

  if (dogData.id) {
    const { data, error } = await supabase
      .from("dogs")
      .update(dogData)
      .eq("id", dogData.id)
      .select()
      .single();

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  }

  const { data, error } = await supabase
    .from("dogs")
    .insert([dogData])
    .select()
    .single();

  if (error) {
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
}

// 🗑 DELETE
export async function deleteDog(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("dogs").delete().eq("id", id);

  return !error;
}

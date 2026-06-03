"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getMatingForLitterGenerator(matingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matings")
    .select(`
      id,
      mating_date,
      outside_stud_name,
      stud_dog_id,
      heats (
        dog_id
      )
    `)
    .eq("id", matingId)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function createLitterFromMating(input: {
  matingId: string;
  motherId?: string;
  fatherId?: string;
  outsideFatherName?: string;
  birthDate: string;
  litterLetter: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("litters")
    .select("id")
    .eq("mating_id", input.matingId)
    .maybeSingle();

  if (existing) {
    throw new Error("Litter already exists for this mating");
  }

  const { data, error } = await supabase
    .from("litters")
    .insert({
      user_id: user.id,
      mating_id: input.matingId,
      mother_id: input.motherId ?? null,
      father_id: input.fatherId ?? null,
      outside_father_name: input.outsideFatherName ?? null,
      birth_date: input.birthDate,
      litter_letter: input.litterLetter.toUpperCase(),
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/litters");
  revalidatePath("/puppies");

  return data;
}
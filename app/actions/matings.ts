"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateMatingInput = {
  heat_id: string;
  mating_date: string; // ISO string
  male_name?: string;
  method?: "natural" | "ai" | "tci" | string;
  notes?: string;
};

export async function createMating(input: CreateMatingInput) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("matings").insert({
    user_id: userData.user.id,
    heat_id: input.heat_id,
    mating_date: input.mating_date,
    male_name: input.male_name ?? null,
    method: input.method ?? null,
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/matings");

  return { success: true };
}

export async function deleteMating(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/matings");

  return { success: true };
}

export async function getMatings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matings")
    .select("*")
    .order("mating_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
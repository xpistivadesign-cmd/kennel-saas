"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MatingMethod = "natural" | "ai" | "tci";

export type Mating = {
  id: string;
  user_id: string;
  heat_id: string;
  mating_date: string;
  male_name: string | null;
  method: MatingMethod | null;
  notes: string | null;
  created_at: string;
};

export type CreateMatingInput = {
  heat_id: string;
  mating_date: string;
  male_name?: string;
  method?: MatingMethod;
  notes?: string;
};

/**
 * CREATE MATING
 */
export async function createMating(
  input: CreateMatingInput
): Promise<Mating> {
  const supabase = await createClient();

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("matings")
    .insert({
      user_id: userData.user.id,
      heat_id: input.heat_id,
      mating_date: input.mating_date,
      male_name: input.male_name ?? null,
      method: input.method ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create mating");
  }

  revalidatePath("/protected/matings");

  return data as Mating;
}

/**
 * DELETE MATING
 */
export async function deleteMating(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matings")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected/matings");

  return { success: true };
}

/**
 * GET MATINGS
 */
export async function getMatings(): Promise<Mating[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matings")
    .select("*")
    .order("mating_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Mating[];
}

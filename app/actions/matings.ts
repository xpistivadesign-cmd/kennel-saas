"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type MatingType =
  | "natural"
  | "ai_chilled"
  | "ai_frozen"
  | string;

export type Mating = {
  id: string;
  user_id: string;
  heat_id: string;

  mating_type: string;

  stud_dog_id: string | null;

  outside_stud_name: string | null;

  outside_stud_reg_number: string | null;

  first_mating_date: string;

  chase_mating_date: string | null;

  notes: string | null;

  created_at: string;
};

export type CreateMatingInput = {
  heat_id: string;

  mating_type: MatingType;

  stud_dog_id?: string;

  outside_stud_name?: string;

  outside_stud_reg_number?: string;

  first_mating_date: string;

  chase_mating_date?: string;

  notes?: string;
};

export async function createMating(
  input: CreateMatingInput
): Promise<Mating> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("matings")
    .insert({
      user_id: user.id,

      heat_id: input.heat_id,

      mating_type: input.mating_type,

      stud_dog_id: input.stud_dog_id ?? null,

      outside_stud_name:
        input.outside_stud_name ?? null,

      outside_stud_reg_number:
        input.outside_stud_reg_number ?? null,

      first_mating_date:
        input.first_mating_date,

      chase_mating_date:
        input.chase_mating_date ?? null,

      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ?? "Failed to create mating"
    );
  }

  revalidatePath("/protected/matings");
  revalidatePath("/protected/heats");

  return data as Mating;
}

export async function deleteMating(
  id: string
): Promise<{ success: true }> {
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

export async function getMatings(): Promise<Mating[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("matings")
    .select("*")
    .order("first_mating_date", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Mating[];
}

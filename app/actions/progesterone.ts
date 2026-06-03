"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateProgesteroneInput = {
  heat_id: string;
  test_date: string; // ISO string
  value: number;
  vet_name?: string;
  notes?: string;
};

export async function createProgesteroneTest(
  input: CreateProgesteroneInput
) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("progesterone_tests").insert({
    user_id: userData.user.id,
    heat_id: input.heat_id,
    test_date: input.test_date,
    value: input.value,
    vet_name: input.vet_name ?? null,
    notes: input.notes ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/progesterone");

  return { success: true };
}

export async function deleteProgesteroneTest(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("progesterone_tests")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/progesterone");

  return { success: true };
}

export async function getProgesteroneTests() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("progesterone_tests")
    .select("*")
    .order("test_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
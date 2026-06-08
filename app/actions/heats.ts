"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProgesteroneTest = {
  id: string;
  user_id: string;
  heat_id: string;
  test_date: string;
  value: number;
  vet_name: string | null;
  notes: string | null;
  created_at: string;
};

export type Heat = {
  id: string;
  user_id: string;
  dog_id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  progesterone_tests?: ProgesteroneTest[];
};

export async function getHeatsByDog(
  dogId: string
): Promise<Heat[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("heats")
    .select(`
      *,
      progesterone_tests (
        id,
        user_id,
        heat_id,
        test_date,
        value,
        vet_name,
        notes,
        created_at
      )
    `)
    .eq("dog_id", dogId)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Heat[];
}

export async function createHeatRecord(input: {
  dog_id: string;
  start_date: string;
}): Promise<Heat> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("heats")
    .insert({
      user_id: user.id,
      dog_id: input.dog_id,
      start_date: input.start_date,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create heat record");
  }

  revalidatePath("/protected/heats");
  revalidatePath("/protected/dogs");

  return data as Heat;
}

export async function addProgesteroneTest(input: {
  heat_id: string;
  test_date: string;
  value: number;
  vet_name?: string;
  notes?: string;
}): Promise<ProgesteroneTest> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("progesterone_tests")
    .insert({
      user_id: user.id,
      heat_id: input.heat_id,
      test_date: input.test_date,
      value: input.value,
      vet_name: input.vet_name ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      error?.message ?? "Failed to create progesterone test"
    );
  }

  revalidatePath("/protected/heats");
  revalidatePath("/protected/dogs");

  return data as ProgesteroneTest;
}

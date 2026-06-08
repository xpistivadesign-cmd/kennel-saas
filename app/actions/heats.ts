"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type HeatStatus = "active" | "finished";

export type Heat = {
  id: string;
  dog_id: string;
  start_date: string;
  end_date: string | null;
  status: HeatStatus;
  notes: string | null;
  created_at: string;
  progesterone_tests?: ProgesteroneTest[];
  matings?: Mating[];
};

export type ProgesteroneTest = {
  id: string;
  heat_id: string;
  test_date: string;
  value: number;
  notes: string | null;
  created_at: string;
};

export type Mating = {
  id: string;
  heat_id: string;
  mating_date: string;
  male_name: string | null;
  method: string | null;
};

export async function getHeatsByDog(dogId: string): Promise<Heat[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("heats")
    .select(`
      *,
      progesterone_tests (*),
      matings (*)
    `)
    .eq("dog_id", dogId)
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as Heat[];
}

export async function createHeatRecord(input: {
  dog_id: string;
  start_date: string;
}): Promise<Heat> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("heats")
    .insert({
      dog_id: input.dog_id,
      start_date: input.start_date,
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/protected/heats");

  return data as Heat;
}

export async function addProgesteroneTest(input: {
  heat_id: string;
  test_date: string;
  value: number;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("progesterone_tests")
    .insert({
      heat_id: input.heat_id,
      test_date: input.test_date,
      value: input.value,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/protected/heats");

  return data;
}

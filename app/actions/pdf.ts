"use server";

import { createClient } from "@/lib/supabase/server";

export type LitterReport = {
  litter: any;
  mating: any;
  heat: any;
  puppies: any[];
  sire: any | null;
  dam: any | null;
};

export async function getLitterReport(litterId: string): Promise<LitterReport> {
  const supabase = await createClient();

  // 1. LITTER
  const { data: litter, error: litterError } = await supabase
    .from("litters")
    .select("*")
    .eq("id", litterId)
    .single();

  if (litterError || !litter) {
    throw new Error(litterError?.message ?? "Litter not found");
  }

  // 2. MATING
  const { data: mating } = await supabase
    .from("matings")
    .select("*")
    .eq("id", litter.mating_id)
    .single();

  // 3. HEAT
  const { data: heat } = await supabase
    .from("heats")
    .select("*")
    .eq("id", litter.mating_id)
    .single();

  // 4. PARENTS (dogs table)
  let sire = null;
  let dam = null;

  if (mating?.stud_dog_id) {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", mating.stud_dog_id)
      .single();

    sire = data;
  }

  if (heat?.dog_id) {
    const { data } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", heat.dog_id)
      .single();

    dam = data;
  }

  return {
    litter,
    mating,
    heat,
    puppies: [],
    sire,
    dam,
  };
}

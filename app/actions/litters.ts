"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { wrightCOI } from "@/lib/coi/coi.engine";

export type LitterStatus = "planned" | "born" | "raised";

export type Litter = {
  id: string;
  mating_id: string;
  kennel_id: string;
  birth_date: string | null;
  puppies_count: number | null;
  status: LitterStatus;
  created_at: string;
};

export type PuppyInput = {
  name: string;
  sex: "male" | "female";
  color?: string;
};

/**
 * GET LITTERS (SUPABASE)
 */
export async function getLitters(): Promise<Litter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("litters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * ➕ CREATE LITTER
 */
export async function createLitter(input: {
  mating_id: string;
  kennel_id: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("litters")
    .insert({
      mating_id: input.mating_id,
      kennel_id: input.kennel_id,
      status: "planned",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/litters");

  return data;
}

/**
 * 🐶 MARK LITTER BORN → CREATE PUPPIES + COI
 */
export async function markLitterBorn(input: {
  litterId: string;
  puppies: PuppyInput[];
  birthDate?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1) litter lekérése
  const { data: litter, error: litterError } = await supabase
    .from("litters")
    .select("*")
    .eq("id", input.litterId)
    .single();

  if (litterError || !litter) {
    throw new Error("Litter not found");
  }

  // 2) COI számítás (egyszerűsített logika)
  const coiValue = wrightCOI({
    sireId: litter.mating_id,
    damId: litter.mating_id,
  });

  // 3) puppies létrehozása
  const puppiesToInsert = input.puppies.map((p) => ({
    user_id: user.id,
    litter_id: litter.id,
    name: p.name,
    sex: p.sex,
    color: p.color ?? null,
    collar_color: null,
    birth_weight: null,
    price: null,
    status: "available",
  }));

  const { data: newPuppies, error: puppiesError } = await supabase
    .from("puppies")
    .insert(puppiesToInsert)
    .select();

  if (puppiesError) throw new Error(puppiesError.message);

  // 4) litter update
  const { error: updateError } = await supabase
    .from("litters")
    .update({
      status: "born",
      puppies_count: input.puppies.length,
      birth_date: input.birthDate ?? new Date().toISOString(),
    })
    .eq("id", litter.id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/litters");
  revalidatePath("/puppies");

  return {
    litterId: litter.id,
    puppies: newPuppies,
    coi: coiValue,
  };
}

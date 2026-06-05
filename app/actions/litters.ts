"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
};

export async function getLitters(): Promise<Litter[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("litters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

export async function createLitter(input: {
  mating_id: string;
  kennel_id: string;
}): Promise<Litter> {
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

  if (error || !data) {
    throw new Error(error?.message ?? "Insert failed");
  }

  revalidatePath("/protected/litters");

  return data;
}

export async function markLitterBorn(input: {
  litterId: string;
  puppies: PuppyInput[];
}) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("litters")
    .update({
      status: "born",
      puppies_count: input.puppies.length,
      birth_date: new Date().toISOString(),
    })
    .eq("id", input.litterId);

  if (error) throw new Error(error.message);

  revalidatePath("/protected/litters");
}

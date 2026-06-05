"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import type { Dog, PedigreeNode } from "@/lib/supabase/dogs";

async function getDogById(id: string): Promise<Dog | null> {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Dog;
}

async function buildNode(
  dogId: string,
  generation = 1,
  maxGeneration = 3
): Promise<PedigreeNode | null> {
  const dog = await getDogById(dogId);

  if (!dog) return null;

  const node: PedigreeNode = {
    ...dog,
    generation,
  };

  if (generation >= maxGeneration) {
    return node;
  }

  if (dog.sire_id) {
    node.sire = await buildNode(
      dog.sire_id,
      generation + 1,
      maxGeneration
    );
  }

  if (dog.dam_id) {
    node.dam = await buildNode(
      dog.dam_id,
      generation + 1,
      maxGeneration
    );
  }

  return node;
}

export async function getPedigreeTree(
  dogId: string
): Promise<PedigreeNode | null> {
  return buildNode(dogId, 1, 3);
}

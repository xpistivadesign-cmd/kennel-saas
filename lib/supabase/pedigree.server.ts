import { createServerSupabase } from "./server";
import type { PedigreeNode } from "./dogs";

/**
 * 🧬 3 generációs családfa builder
 */
export async function getPedigreeTree(
  dogId: string,
  maxDepth = 3
): Promise<PedigreeNode | null> {
  const supabase = createServerSupabase();

  const { data: root } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  if (!root) return null;

  return await buildNode(root, supabase, 0, maxDepth);
}

async function buildNode(
  dog: any,
  supabase: any,
  depth: number,
  maxDepth: number
): Promise<PedigreeNode> {
  if (depth >= maxDepth) {
    return dog;
  }

  const [sire, dam] = await Promise.all([
    dog.sire_id
      ? supabase.from("dogs").select("*").eq("id", dog.sire_id).single()
      : Promise.resolve({ data: null }),

    dog.dam_id
      ? supabase.from("dogs").select("*").eq("id", dog.dam_id).single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    ...dog,
    sire: sire.data
      ? await buildNode(sire.data, supabase, depth + 1, maxDepth)
      : null,
    dam: dam.data
      ? await buildNode(dam.data, supabase, depth + 1, maxDepth)
      : null,
  };
}

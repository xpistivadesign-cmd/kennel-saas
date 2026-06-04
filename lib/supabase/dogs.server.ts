import { createServerSupabase } from "./server";

export interface Dog {
  id?: string;
  name: string;
  reg_number?: string;
  birth_date?: string;
  breed: string;
  gender: "male" | "female";
  owner_id?: string;
  sire_id?: string;
  dam_id?: string;
}

export interface PedigreeNode extends Dog {
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
}

// 🐶 ÖSSZES KUTYA
export async function getDogs(): Promise<Dog[]> {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

// 🧬 REKURZÍV PEDIGREE (3 generáció)
export async function getPedigree(
  dogId: string,
  currentGeneration = 1,
  maxGeneration = 3
): Promise<PedigreeNode | null> {
  if (currentGeneration > maxGeneration) return null;

  const supabase = createServerSupabase();

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  if (error || !dog) return null;

  const node: PedigreeNode = { ...dog };

  if (dog.sire_id && dog.sire_id !== dogId) {
    node.sire = await getPedigree(
      dog.sire_id,
      currentGeneration + 1,
      maxGeneration
    );
  }

  if (dog.dam_id && dog.dam_id !== dogId) {
    node.dam = await getPedigree(
      dog.dam_id,
      currentGeneration + 1,
      maxGeneration
    );
  }

  return node;
}

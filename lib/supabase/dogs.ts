import { createClient } from "./server";

/**
 * 🐶 Dog alap típus
 */
export interface Dog {
  id?: string;
  name: string;
  reg_number?: string;
  birth_date?: string;
  breed: string;
  gender: "male" | "female";
  owner_id?: string;

  // 🧬 pedigree kapcsolatok
  sire_id?: string; // apa
  dam_id?: string;  // anya
}

/**
 * 🌳 Rekurzív családfa node
 */
export interface PedigreeNode extends Dog {
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
}

/**
 * 1. ÖSSZES KUTYA LEKÉRÉSE
 */
export async function getDogs(): Promise<Dog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getDogs error:", error.message);
      return [];
    }

    return (data as Dog[]) || [];
  } catch (e) {
    console.error("getDogs exception:", e);
    return [];
  }
}

/**
 * 2. 🧬 CSALÁDFA LEKÉRÉSE (max 3 generáció, loop védelem)
 */
export async function getPedigree(
  dogId: string,
  currentGeneration: number = 1,
  maxGeneration: number = 3
): Promise<PedigreeNode | null> {
  if (!dogId) return null;
  if (currentGeneration > maxGeneration) return null;

  try {
    const supabase = await createClient();

    const { data: dog, error } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", dogId)
      .single();

    if (error || !dog) {
      console.error("getPedigree fetch error:", error?.message);
      return null;
    }

    const node: PedigreeNode = dog as PedigreeNode;

    // 🧬 APA
    if (dog.sire_id && dog.sire_id !== dogId) {
      node.sire = await getPedigree(
        dog.sire_id,
        currentGeneration + 1,
        maxGeneration
      );
    } else {
      node.sire = null;
    }

    // 🧬 ANYA
    if (dog.dam_id && dog.dam_id !== dogId) {
      node.dam = await getPedigree(
        dog.dam_id,
        currentGeneration + 1,
        maxGeneration
      );
    } else {
      node.dam = null;
    }

    return node;
  } catch (e) {
    console.error("getPedigree exception:", e);
    return null;
  }
}

/**
 * 3. 📝 KUTYA MENTÉSE / FRISSÍTÉSE
 */
export async function saveDog(dogData: Dog): Promise<{
  success: boolean;
  data: Dog | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    // UPDATE
    if (dogData.id) {
      const { data, error } = await supabase
        .from("dogs")
        .update(dogData)
        .eq("id", dogData.id)
        .select()
        .single();

      if (error) {
        return { success: false, data: null, error: error.message };
      }

      return { success: true, data: data as Dog, error: null };
    }

    // INSERT
    const { data, error } = await supabase
      .from("dogs")
      .insert([dogData])
      .select()
      .single();

    if (error) {
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data as Dog, error: null };
  } catch (e: any) {
    return {
      success: false,
      data: null,
      error: e?.message || "Ismeretlen hiba",
    };
  }
}

/**
 * 4. 🗑️ KUTYA TÖRLÉSE
 */
export async function deleteDog(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("dogs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("deleteDog error:", error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.error("deleteDog exception:", e);
    return false;
  }
}

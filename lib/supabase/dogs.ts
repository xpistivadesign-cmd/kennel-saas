import { createClient } from "./server";

export interface Dog {
  id?: string;
  name: string;
  reg_number?: string;
  birth_date?: string;
  breed: string;
  gender: "male" | "female";
  owner_id?: string;
}

export async function getDogs(): Promise<Dog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Supabase dogs fetch hiba, fallback üres tömbre:",
        error.message
      );
      return [];
    }

    return (data as Dog[]) || [];
  } catch (error) {
    console.error(
      "Kritikus hiba a dogs lekérésénél, SSR crash megakadályozva:",
      error
    );
    return [];
  }
}

export async function saveDog(
  dogData: Dog
): Promise<{
  success: boolean;
  data: Dog | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    if (dogData.id) {
      const { data, error } = await supabase
        .from("dogs")
        .update({
          name: dogData.name,
          reg_number: dogData.reg_number,
          birth_date: dogData.birth_date,
          breed: dogData.breed,
          gender: dogData.gender,
          owner_id: dogData.owner_id,
        })
        .eq("id", dogData.id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: error.message,
        };
      }

      return {
        success: true,
        data: data as Dog,
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("dogs")
      .insert([
        {
          name: dogData.name,
          reg_number: dogData.reg_number,
          birth_date: dogData.birth_date,
          breed: dogData.breed,
          gender: dogData.gender,
          owner_id: dogData.owner_id,
        },
      ])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as Dog,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Ismeretlen CRUD hiba",
    };
  }
}

export async function deleteDog(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("dogs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Hiba a kutya törlésekor:",
        error.message
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Kritikus hiba törlés közben:",
      error
    );
    return false;
  }
}

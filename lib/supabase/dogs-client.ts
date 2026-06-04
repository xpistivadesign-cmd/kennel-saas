import { createClient } from "@supabase/supabase-js";
import type { Dog } from "./dogs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveDog(dog: Dog) {
  try {
    if (dog.id) {
      const { data, error } = await supabase
        .from("dogs")
        .update(dog)
        .eq("id", dog.id)
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
        data,
        error: null,
      };
    }

    const { data, error } = await supabase
      .from("dogs")
      .insert([dog])
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
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Ismeretlen hiba",
    };
  }
}

export async function deleteDog(id: string) {
  try {
    const { error } = await supabase
      .from("dogs")
      .delete()
      .eq("id", id);

    return !error;
  } catch {
    return false;
  }
}

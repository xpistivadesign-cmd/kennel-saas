import "server-only";

import { createClient } from "./server";

export interface Dog {
  id?: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  reg_number?: string;
  birth_date?: string;
}

export async function getDogs(): Promise<Dog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("dogs")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return [];
    }

    return (data as Dog[]) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

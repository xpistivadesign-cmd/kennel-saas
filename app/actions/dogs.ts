"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateDogInput = {
  name: string;
  sex: "male" | "female";
  breed: string;
};

export async function createDogSecure(input: CreateDogInput) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("dogs")
    .insert({
      name: input.name,
      sex: input.sex,
      breed: input.breed,

      // SAFE SERVER-SIDE CONTEXT
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/protected/dogs");

  return data;
}
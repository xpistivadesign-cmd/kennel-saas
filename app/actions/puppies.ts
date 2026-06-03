"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * CREATE PUPPY
 */
export async function createPuppy(input: {
  litterId: string;
  name: string;
  sex: "male" | "female";
  color?: string;
  collarColor?: string;
  birthWeight?: number;
  price?: number;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("puppies")
    .insert({
      user_id: user.id,
      litter_id: input.litterId,
      name: input.name,
      sex: input.sex,
      color: input.color ?? null,
      collar_color: input.collarColor ?? null,
      birth_weight: input.birthWeight ?? null,
      price: input.price ?? null,
      status: "available",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/protected/puppies");

  return data;
}

/**
 * DELETE PUPPY (FIXED — BUILD SAFE)
 */
export async function deletePuppy(formData: FormData) {
  const id = formData.get("puppyId") as string;

  if (!id) throw new Error("Missing puppyId");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("puppies")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/protected/puppies");

  return { success: true };
}
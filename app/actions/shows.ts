"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DogShow = {
  id: string;
  user_id: string;
  dog_id: string;
  show_name: string;
  show_date: string;
  location: string | null;
  judge_name: string | null;
  class: string | null;
  placement: number | null;
  titles_won: string | null;
  notes: string | null;
  created_at: string;
};

export type CreateShowInput = {
  dog_id: string;
  show_name: string;
  show_date: string;
  location?: string;
  judge_name?: string;
  class?: string;
  placement?: number;
  titles_won?: string;
  notes?: string;
};

export async function getDogShows(dogId?: string): Promise<DogShow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("dog_shows")
    .select("*")
    .order("show_date", { ascending: false });

  if (dogId) {
    query = query.eq("dog_id", dogId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createShowRecord(
  input: CreateShowInput
): Promise<DogShow> {
  const supabase = await createClient();

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("dog_shows")
    .insert({
      user_id: userData.user.id,
      dog_id: input.dog_id,
      show_name: input.show_name,
      show_date: input.show_date,
      location: input.location ?? null,
      judge_name: input.judge_name ?? null,
      class: input.class ?? null,
      placement: input.placement ?? null,
      titles_won: input.titles_won ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Insert failed");
  }

  revalidatePath("/protected/shows");

  return data;
}

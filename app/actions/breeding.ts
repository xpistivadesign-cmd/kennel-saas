"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

async function getUser() {
  const supabase = createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Unauthorized");
  return { supabase, user: data.user };
}

async function assertFemale(dogId: string, supabase: any) {
  const { data } = await supabase
    .from("dogs")
    .select("sex")
    .eq("id", dogId)
    .single();

  if (!data || data.sex !== "Female") {
    throw new Error("Breeding actions only allowed for Female dogs.");
  }
}

export async function addHeatAction(dogId: string, formData: FormData) {
  const { supabase, user } = await getUser();
  await assertFemale(dogId, supabase);

  const { error } = await supabase.from("heats").insert({
    dog_id: dogId,
    user_id: user.id,
    start_date: String(formData.get("start_date")),
    progesterone: Number(formData.get("progesterone")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

export async function addMatingAction(dogId: string, formData: FormData) {
  const { supabase, user } = await getUser();
  await assertFemale(dogId, supabase);

  const { error } = await supabase.from("matings").insert({
    female_id: dogId,
    user_id: user.id,
    male_name: String(formData.get("male_name")),
    date: String(formData.get("date")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

export async function addWhelpingAction(dogId: string, formData: FormData) {
  const { supabase, user } = await getUser();
  await assertFemale(dogId, supabase);

  const { error } = await supabase.from("litters").insert({
    dam_id: dogId,
    user_id: user.id,
    birth_date: String(formData.get("birth_date")),
    live_puppies: Number(formData.get("live_puppies")),
    dead_puppies: Number(formData.get("dead_puppies")),
    status: "Active",
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

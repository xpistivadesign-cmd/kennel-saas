"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

async function requireUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access");
  return { supabase, user };
}

export async function addGlobalHeatAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const dogId = String(formData.get("dog_id"));
  const startDate = String(formData.get("start_date"));
  const notes = String(formData.get("notes") ?? "");

  if (!dogId || dogId === "null" || dogId === "") {
    throw new Error("Please select a female dog.");
  }

  const { error } = await supabase.from("heat_cycles").insert({
    dog_id: dogId,
    start_date: startDate,
    notes: notes,
    user_id: user.id
  });

  if (error) throw new Error(error.message);

  revalidatePath("/heats");
}

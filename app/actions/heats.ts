"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createHeat(formData: { dogId: string; startDate: string; endDate?: string; notes?: string }) {
  const supabase = await createClient();

  // 1. Szerveroldali session validáció (Double Lock)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized access attempt.");

  // 2. Biztonságos beszúrás (a user_id-t a DB trigger automatikusan beinjektálja)
  const { data, error } = await supabase
    .from("heats")
    .insert({
      dog_id: formData.dogId,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      notes: formData.notes || null
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/protected/heats");
  return data;
}
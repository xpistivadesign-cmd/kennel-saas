"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

async function requireUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access");
  return { supabase, user };
}

export async function addDogAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const sireSelection = String(formData.get("sire_id") ?? "null");
  const damSelection = String(formData.get("dam_id") ?? "null");

  const payload: any = {
    name: String(formData.get("name")),
    breed: String(formData.get("breed") ?? ""),
    sex: String(formData.get("sex")),
    birth_date: String(formData.get("birth_date")) || null,
    microchip_number: String(formData.get("microchip_number")) || null,
    passport_number: String(formData.get("passport_number")) || null,
    color: String(formData.get("color") ?? ""),
    user_id: user.id
  };

  // Sire hibrid mentés kiértékelése
  if (sireSelection !== "null" && sireSelection !== "other") {
    payload.sire_id = sireSelection;
    payload.sire_name = null;
  } else if (sireSelection === "other") {
    payload.sire_id = null;
    payload.sire_name = String(formData.get("sire_name") ?? "");
  }

  // Dam hibrid mentés kiértékelése
  if (damSelection !== "null" && damSelection !== "other") {
    payload.dam_id = damSelection;
    payload.dam_name = null;
  } else if (damSelection === "other") {
    payload.dam_id = null;
    payload.dam_name = String(formData.get("dam_name") ?? "");
  }

  const { error } = await supabase.from("dogs").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/dogs");
  redirect("/dogs");
}

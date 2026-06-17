"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

async function requireUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access denied.");
  return { supabase, user };
}

/** 1. KUTYA ÉS CSALÁDFA ADATOK MÓDOSÍTÁSA */
export async function updateDogProfileAction(dogId: string, currentTab: string, formData: FormData) {
  const { supabase } = await requireUser();

  const payload: any = {
    name: String(formData.get("name") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    color: String(formData.get("color") ?? ""),
    birth_date: String(formData.get("birth_date") ?? "") || null,
    microchip_number: String(formData.get("microchip_number") ?? "") || null,
    passport_number: String(formData.get("passport_number") ?? "") || null,
    registration_number: String(formData.get("registration_number") ?? "") || null,
  };

  // Ha a családfa formból jönnek az adatok, azokat is elmentjük (UUID és Text fallback is)
  if (formData.has("sire_id")) {
    const sireId = formData.get("sire_id");
    payload.sire_id = sireId && sireId !== "null" ? String(sireId) : null;
  }
  if (formData.has("dam_id")) {
    const damId = formData.get("dam_id");
    payload.dam_id = damId && damId !== "null" ? String(damId) : null;
  }
  if (formData.has("sire_name")) payload.sire_name = String(formData.get("sire_name") || "") || null;
  if (formData.has("dam_name")) payload.dam_name = String(formData.get("dam_name") || "") || null;

  const { error } = await supabase
    .from("dogs")
    .update(payload)
    .eq("id", dogId);

  if (error) throw new Error(error.message);
  
  // Tiszta visszairányítás az edit mód lezárásához
  redirect(`/dogs/${dogId}?tab=${currentTab}`);
}

/** 2. ORVOSI ADAT HOZZÁADÁSA */
export async function addMedicalRecordAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("dog_events").insert({
    dog_id: dogId,
    date: String(formData.get("date")),
    event_type: String(formData.get("type")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

/** 3. KIÁLLÍTÁSI EREDMÉNY HOZZÁADÁSA */
export async function addShowResultAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("dog_shows").insert({
    dog_id: dogId,
    show_name: String(formData.get("show_name")),
    date: String(formData.get("date")),
    location: String(formData.get("location") ?? ""),
    placement: String(formData.get("placement") ?? ""),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

/** 4. TÜZELÉSI CIKLUS HOZZÁADÁSA */
export async function addHeatAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("heat_cycles").insert({
    dog_id: dogId,
    start_date: String(formData.get("start_date")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

/** 5. PROGESZTERON TESZT HOZZÁADÁSA */
export async function addProgesteroneAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("progesterone_tests").insert({
    dog_id: dogId,
    date: String(formData.get("date")),
    progesterone: parseFloat(String(formData.get("progesterone") ?? "0")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

/** 6. FEDEZTETÉS HOZZÁADÁSA */
export async function addMatingAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const { error } = await supabase.from("matings").insert({
    female_id: dogId,
    male_name: String(formData.get("male_name")),
    date: String(formData.get("mating_date")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

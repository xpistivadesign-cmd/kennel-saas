"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

async function requireUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access denied.");
  return { supabase, user };
}

/** 1. KUTYA ADATOK MÓDOSÍTÁSA */
export async function updateDogProfileAction(dogId: string, formData: FormData) {
  const { supabase } = await requireUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    color: String(formData.get("color") ?? ""),
    birth_date: String(formData.get("birth_date") ?? "") || null,
    microchip_number: String(formData.get("microchip_number") ?? "") || null,
    passport_number: String(formData.get("passport_number") ?? "") || null,
    registration_number: String(formData.get("registration_number") ?? "") || null,
  };

  const { error } = await supabase
    .from("dogs")
    .update(payload)
    .eq("id", dogId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dogs/${dogId}`);
}

/** 2. ORVOSI ADAT HOZZÁADÁSA (DOG_EVENTS TÁBLA) */
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

/** 3. KIÁLLÍTÁSI EREDMÉNY HOZZÁADÁSA (DOG_SHOWS TÁBLA) */
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

/** 4. TÜZELÉSI CIKLUS HOZZÁADÁSA (HEAT_CYCLES TÁBLA) */
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

/** 5. PROGESZTERON TESZT HOZZÁADÁSA (PROGESTERONE_TESTS TÁBLA) */
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

/** 6. FEDEZTETÉS HOZZÁADÁSA (MATINGS TÁBLA) */
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

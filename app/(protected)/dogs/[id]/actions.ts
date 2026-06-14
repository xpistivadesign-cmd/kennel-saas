"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

// Közös felhasználó-ellenőrző biztonsági guard
async function requireUser() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized access denied.");
  return { supabase, user };
}

/** 1. KUTYA ADATOK MÓDOSÍTÁSA (EDIT FORM) */
export async function updateDogProfileAction(dogId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

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
    .eq("id", dogId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}`);
}

/** 2. PROFILKÉP FELTÖLTÉSE A SUPABASE STORAGE-BA */
export async function uploadDogImageAction(dogId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filePath = `${user.id}/${dogId}-${Date.now()}.jpg`;

  // Biztonságos feltöltés a dog-photos bucketbe
  const { error: uploadError } = await supabase.storage
    .from("dog-photos")
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true
    });

  if (uploadError) throw new Error(uploadError.message);

  // Nyilvános URL lekérése
  const { data } = supabase.storage.from("dog-photos").getPublicUrl(filePath);

  // dogs tábla image_url mezőjének frissítése
  const { error: updateError } = await supabase
    .from("dogs")
    .update({ image_url: data.publicUrl })
    .eq("id", dogId)
    .eq("user_id", user.id);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/dogs/${dogId}`);
}

/** 3. ÚJ ORVOSI ADAT HOZZÁADÁSA (MEDICAL RECORD) */
export async function addMedicalRecordAction(dogId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("medical_records").insert({
    dog_id: dogId,
    user_id: user.id,
    date: String(formData.get("date")),
    type: String(formData.get("type")),
    notes: String(formData.get("notes") ?? ""),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}?tab=medical`);
}

/** 4. ÚJ KIÁLLÍTÁSI EREDMÉNY HOZZÁADÁSA (SHOW RESULT) */
export async function addShowResultAction(dogId: string, formData: FormData) {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("dog_shows").insert({
    dog_id: dogId,
    user_id: user.id,
    show_name: String(formData.get("show_name")),
    date: String(formData.get("date")),
    location: String(formData.get("location") ?? ""),
    placement: String(formData.get("placement") ?? ""),
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}?tab=shows`);
}
// =========================
// BREEDING ACTIONS (FIX)
// =========================

export async function addHeatAction(formData: FormData) {
  const dog_id = formData.get("dog_id") as string;

  await supabase()
    .from("heat_cycles")
    .insert({
      dog_id,
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      notes: formData.get("notes"),
    });
}

export async function addMatingAction(formData: FormData) {
  const female_id = formData.get("female_id") as string;

  await supabase()
    .from("matings")
    .insert({
      female_id,
      male_id: formData.get("male_id"),
      mating_date: formData.get("mating_date"),
      notes: formData.get("notes"),
    });
}

export async function addWhelpingAction(formData: FormData) {
  const female_id = formData.get("female_id") as string;

  // ha nincs külön table, ideiglenesen matings vagy litters
  await supabase()
    .from("litters")
    .insert({
      female_id,
      whelping_date: formData.get("whelping_date"),
      puppies_count: formData.get("puppies_count"),
      notes: formData.get("notes"),
    });
}

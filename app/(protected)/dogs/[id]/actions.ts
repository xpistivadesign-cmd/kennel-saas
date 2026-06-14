"use server";

import { createClient } from "@/lib/supabase/server";

// DOG PROFILE
export async function updateDogProfileAction(formData: FormData) {
  const id = formData.get("id") as string;

  const passport_number = formData.get("passport_number") as string;
  const registration_number = formData.get("registration_number") as string;

  const supabase = await createClient();

  await supabase
    .from("dogs")
    .update({
      passport_number: passport_number || null,
      registration_number: registration_number || null,
    })
    .eq("id", id);
}

// MEDICAL
export async function addMedicalRecordAction(formData: FormData) {
  const dog_id = formData.get("dog_id") as string;
  const type = formData.get("type") as string;
  const notes = formData.get("notes") as string;

  const supabase = await createClient();

  await supabase.from("medical_records").insert({
    dog_id,
    type,
    notes,
  });
}

// SHOWS
export async function addShowResultAction(formData: FormData) {
  const dog_id = formData.get("dog_id") as string;
  const show_name = formData.get("show_name") as string;
  const result = formData.get("result") as string;

  const supabase = await createClient();

  await supabase.from("dog_shows").insert({
    dog_id,
    show_name,
    result,
  });
}

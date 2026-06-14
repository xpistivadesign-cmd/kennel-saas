"use server";

import { createClient } from "@/lib/supabase/server";

/* =========================
   DOG PROFILE
========================= */

export async function updateDogProfileAction(formData: FormData) {
  const supabase = await createClient();

  await supabase
    .from("dogs")
    .update({
      passport_number: formData.get("passport_number") || null,
      registration_number: formData.get("registration_number") || null,
    })
    .eq("id", formData.get("id"));
}

/* =========================
   MEDICAL
========================= */

export async function addMedicalRecordAction(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("medical_records").insert({
    dog_id: formData.get("dog_id"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });
}

/* =========================
   SHOWS
========================= */

export async function addShowResultAction(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("dog_shows").insert({
    dog_id: formData.get("dog_id"),
    show_name: formData.get("show_name"),
    result: formData.get("result"),
  });
}

/* =========================
   BREEDING
========================= */

export async function addHeatCycleAction(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("heat_cycles").insert({
    dog_id: formData.get("dog_id"),
    start_date: formData.get("start_date"),
    progesterone: formData.get("progesterone"),
    notes: formData.get("notes"),
  });
}

export async function addMatingAction(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("matings").insert({
    female_id: formData.get("female_id"),
    male_id: formData.get("male_id"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });
}

export async function addLitterAction(formData: FormData) {
  const supabase = await createClient();

  await supabase.from("litters").insert({
    female_id: formData.get("female_id"),
    birth_date: formData.get("birth_date"),
    live_puppies: formData.get("live_puppies"),
    dead_puppies: formData.get("dead_puppies"),
  });
}

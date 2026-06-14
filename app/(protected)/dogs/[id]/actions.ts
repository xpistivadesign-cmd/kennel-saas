"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function supabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

/* =========================
   DOG PROFILE UPDATE
========================= */

export async function updateDogProfileAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb
    .from("dogs")
    .update({
      name: formData.get("name"),
      breed: formData.get("breed"),
      color: formData.get("color"),
      birth_date: formData.get("birth_date"),
      microchip_number: formData.get("microchip_number"),
      passport_number: formData.get("passport_number"),
      registration_number: formData.get("registration_number"),
    })
    .eq("id", dogId);
}

/* =========================
   IMAGE UPLOAD (SAFE PLACEHOLDER)
========================= */

export async function uploadDogImageAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  // TODO: ide jön Supabase Storage később
  const file = formData.get("file");

  await sb
    .from("dogs")
    .update({
      image_url: "uploaded-image-placeholder.jpg",
    })
    .eq("id", dogId);
}

/* =========================
   MEDICAL RECORD
========================= */

export async function addMedicalRecordAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb.from("medical_records").insert({
    dog_id: dogId,
    date: formData.get("date"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });
}

/* =========================
   SHOW RESULT
========================= */

export async function addShowResultAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb.from("dog_shows").insert({
    dog_id: dogId,
    show_name: formData.get("show_name"),
    date: formData.get("date"),
    location: formData.get("location"),
    placement: formData.get("placement"),
  });
}

/* =========================
   BREEDING (KÜLÖN MODUL)
========================= */

export async function addHeatCycleAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb.from("heat_cycles").insert({
    dog_id: dogId,
    start_date: formData.get("start_date"),
    notes: formData.get("notes"),
  });
}

export async function addProgesteroneTestAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb.from("progesterone_tests").insert({
    dog_id: dogId,
    date: formData.get("date"),
    value: formData.get("value"),
    notes: formData.get("notes"),
  });
}

export async function addMatingAction(dogId: string, formData: FormData) {
  const sb = await supabase();

  await sb.from("matings").insert({
    female_id: dogId,
    male_name: formData.get("male_name"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });
}

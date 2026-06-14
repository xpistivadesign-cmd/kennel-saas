"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function supabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// PROFILE IMAGE
export async function uploadDogImageAction(dogId: string, formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) return;

  const supabaseClient = supabase();

  const filePath = `${dogId}/${Date.now()}-${file.name}`;

  const { error } = await supabaseClient.storage
    .from("dog-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from("dog-images")
    .getPublicUrl(filePath);

  await supabaseClient
    .from("dogs")
    .update({ image_url: data.publicUrl })
    .eq("id", dogId);
}

// MEDICAL
export async function addMedicalRecordAction(dogId: string, formData: FormData) {
  const supabaseClient = supabase();

  await supabaseClient.from("medical_records").insert({
    dog_id: dogId,
    date: formData.get("date"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });
}

// SHOWS
export async function addShowResultAction(dogId: string, formData: FormData) {
  const supabaseClient = supabase();

  await supabaseClient.from("dog_shows").insert({
    dog_id: dogId,
    show_name: formData.get("show_name"),
    date: formData.get("date"),
    location: formData.get("location"),
    placement: formData.get("placement"),
  });
}

// BREEDING FIXED ACTION (EZ VOLT A BAJ)
export async function addHeatCycleAction(dogId: string, formData: FormData) {
  const supabaseClient = supabase();

  await supabaseClient.from("heat_cycles").insert({
    dog_id: dogId,
    start_date: formData.get("start_date"),
    notes: formData.get("notes"),
  });
}

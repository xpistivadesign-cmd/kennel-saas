"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateDogProfileAction(dogId: string, formData: FormData) {
  const supabase = await createServerSupabase();

  await supabase.from("dogs").update({
    name: formData.get("name"),
    breed: formData.get("breed"),
    color_markings: formData.get("color"),
    birth_date: formData.get("birth_date"),
    microchip_number: formData.get("microchip_number"),
    passport_number: formData.get("passport_number"),
    registration_number: formData.get("registration_number"),
  }).eq("id", dogId);

  revalidatePath(`/dogs/${dogId}`);
}

export async function addMedicalRecordAction(dogId: string, formData: FormData) {
  const supabase = await createServerSupabase();

  await supabase.from("medical_records").insert({
    dog_id: dogId,
    date: formData.get("date"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });

  revalidatePath(`/dogs/${dogId}`);
}

export async function addShowResultAction(dogId: string, formData: FormData) {
  const supabase = await createServerSupabase();

  await supabase.from("dog_shows").insert({
    dog_id: dogId,
    show_name: formData.get("show_name"),
    date: formData.get("date"),
    location: formData.get("location"),
    placement: formData.get("placement"),
  });

  revalidatePath(`/dogs/${dogId}`);
}

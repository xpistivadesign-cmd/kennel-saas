"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function updateDogProfileAction(
  dogId: string,
  formData: FormData,
) {
  const { supabase, user } = await requireUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    breed: String(formData.get("breed") ?? ""),
    color: String(formData.get("color") ?? ""),
    birth_date: String(formData.get("birth_date") ?? "") || null,
    microchip_number:
      String(formData.get("microchip_number") ?? "") || null,
    registration_number:
      String(formData.get("registration_number") ?? "") || null,
    passport_number:
      String(formData.get("passport_number") ?? "") || null,
    is_public: formData.get("is_public") === "on",
    is_for_sale: formData.get("is_for_sale") === "on",
  };

  const { error } = await supabase
    .from("dogs")
    .update(payload)
    .eq("id", dogId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dogs/${dogId}`);
}

export async function addHeatAction(
  dogId: string,
  formData: FormData,
) {
  const { supabase, user } = await requireUser();

  const startDate = String(formData.get("start_date") ?? "");
  const progesterone = Number(
    formData.get("progesterone") ?? 0,
  );

  const notes = String(formData.get("notes") ?? "");

  const { error } = await supabase
    .from("heats")
    .insert({
      user_id: user.id,
      dog_id: dogId,
      start_date: startDate,
      progesterone,
      notes,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

export async function addMatingAction(
  dogId: string,
  formData: FormData,
) {
  const { supabase, user } = await requireUser();

  const date = String(
    formData.get("mating_date") ?? "",
  );

  const maleName = String(
    formData.get("male_name") ?? "",
  );

  const notes = String(
    formData.get("notes") ?? "",
  );

  const { error } = await supabase
    .from("matings")
    .insert({
      user_id: user.id,
      female_id: dogId,
      date,
      male_name: maleName,
      notes,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

export async function addWhelpingAction(
  dogId: string,
  formData: FormData,
) {
  const { supabase, user } = await requireUser();

  const birthDate = String(
    formData.get("birth_date") ?? "",
  );

  const litterName = String(
    formData.get("litter_name") ?? "",
  );

  const livePuppies = Number(
    formData.get("live_puppies") ?? 0,
  );

  const deadPuppies = Number(
    formData.get("dead_puppies") ?? 0,
  );

  const { error } = await supabase
    .from("litters")
    .insert({
      user_id: user.id,
      dam_id: dogId,
      litter_name: litterName,
      birth_date: birthDate,
      live_puppies: livePuppies,
      dead_puppies: deadPuppies,
      status: "Active",
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/litters");
  revalidatePath(`/dogs/${dogId}?tab=breeding`);
}

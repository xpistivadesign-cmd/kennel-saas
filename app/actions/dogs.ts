"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

function assertUser(userId?: string) {
  if (!userId) throw new Error("Unauthorized");
}

export async function updateDogProfileAction(dogId: string, formData: FormData) {
  const supabase = createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  assertUser(user?.id);

  const payload = {
    name: String(formData.get("name")),
    breed: String(formData.get("breed")),
    color: String(formData.get("color")),
    birth_date: String(formData.get("birth_date")) || null,
    microchip_number: String(formData.get("microchip_number")) || null,
    passport_number: String(formData.get("passport_number")) || null,
    registration_number: String(formData.get("registration_number")) || null,
  };

  const { error } = await supabase
    .from("dogs")
    .update(payload)
    .eq("id", dogId)
    .eq("user_id", user!.id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dogId}`);
}

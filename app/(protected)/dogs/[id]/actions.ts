```ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return {
    supabase,
    user,
  };
}

export async function addHeatAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const dogId = String(formData.get("dogId") ?? "");
  const startDate = String(formData.get("startDate") ?? "");
  const progesteroneRaw = String(formData.get("progesterone") ?? "");
  const notes = String(formData.get("notes") ?? "");

  const progesterone =
    progesteroneRaw.length > 0
      ? Number(progesteroneRaw)
      : null;

  if (!dogId || !startDate) {
    throw new Error("Missing fields");
  }

  await supabase
    .from("heats")
    .insert({
      user_id: user.id,
      dog_id: dogId,
      start_date: startDate,
      progesterone,
      notes,
    });

  revalidatePath(`/dogs/${dogId}`);
}

export async function addMatingAction(formData: FormData) {
  const { supabase, user } = await requireUser();

  const femaleId = String(
    formData.get("femaleId") ?? ""
  );

  const matingDate = String(
    formData.get("matingDate") ?? ""
  );

  const maleName = String(
    formData.get("maleName") ?? ""
  );

  const notes = String(
    formData.get("notes") ?? ""
  );

  if (!femaleId || !matingDate) {
    throw new Error("Missing fields");
  }

  await supabase
    .from("matings")
    .insert({
      user_id: user.id,
      female_id: femaleId,
      male_name: maleName,
      date: matingDate,
      notes,
    });

  revalidatePath(`/dogs/${femaleId}`);
}

export async function addWhelpingAction(
  formData: FormData
) {
  const { supabase, user } = await requireUser();

  const damId = String(
    formData.get("damId") ?? ""
  );

  const birthDate = String(
    formData.get("birthDate") ?? ""
  );

  const litterName = String(
    formData.get("litterName") ?? ""
  );

  const livePuppies =
    Number(
      formData.get("livePuppies") ?? 0
    );

  const deadPuppies =
    Number(
      formData.get("deadPuppies") ?? 0
    );

  if (!damId || !birthDate) {
    throw new Error("Missing fields");
  }

  await supabase
    .from("litters")
    .insert({
      user_id: user.id,
      dam_id: damId,
      birth_date: birthDate,
      name: litterName,
      live_puppies: livePuppies,
      dead_puppies: deadPuppies,
      status: "Active",
    });

  revalidatePath(`/dogs/${damId}`);
  revalidatePath("/litters");
}
```

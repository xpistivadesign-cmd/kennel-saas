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
   HEAT CYCLE
========================= */

export async function addHeatCycleAction(dogId: string, formData: FormData) {
  const supabaseClient = await supabase();

  const start_date = formData.get("start_date");
  const notes = formData.get("notes");

  await supabaseClient.from("heat_cycles").insert({
    dog_id: dogId,
    start_date,
    notes,
  });
}

/* =========================
   PROGESTERONE
========================= */

export async function addProgesteroneTestAction(
  dogId: string,
  formData: FormData
) {
  const supabaseClient = await supabase();

  await supabaseClient.from("progesterone_tests").insert({
    dog_id: dogId,
    date: formData.get("date"),
    value: formData.get("value"),
    notes: formData.get("notes"),
  });
}

/* =========================
   MATING
========================= */

export async function addMatingAction(dogId: string, formData: FormData) {
  const supabaseClient = await supabase();

  await supabaseClient.from("matings").insert({
    female_id: dogId,
    male_name: formData.get("male_name"),
    date: formData.get("date"),
    notes: formData.get("notes"),
  });
}

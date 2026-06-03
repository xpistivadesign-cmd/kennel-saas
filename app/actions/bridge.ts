"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 🧠 Bridge Layer - READ ONLY
 * Pregnancy timeline aggregation from SQL view
 */

export async function getActivePregnancies() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return [];

  const { data, error } = await supabase
    .from("pregnancy_timeline_view")
    .select(`
      mating_id,
      user_id,
      first_mating_date,
      female_dog_name,
      ultrasound_date,
      xray_date,
      expected_whelping_date,
      days_until_whelping
    `)
    .eq("user_id", user.id)
    .order("expected_whelping_date", { ascending: true });

  if (error) {
    console.error("❌ bridge error:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * 🧪 Optional helper: urgent pregnancies (≤ 7 days)
 */
export async function getUrgentPregnancies() {
  const pregnancies = await getActivePregnancies();

  return pregnancies.filter((p) => {
    if (typeof p.days_until_whelping !== "number") return false;
    return p.days_until_whelping <= 7;
  });
}
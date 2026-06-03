"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPregnancyReminders() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("pregnancy_timeline_view")
    .select("*")
    .gte("expected_whelping_date", today)
    .order("expected_whelping_date", { ascending: true });

  if (error) {
    console.error("Pregnancy view error:", error.message);
    return [];
  }

  return data ?? [];
}
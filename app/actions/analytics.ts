"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAnalyticsData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("progesterone_tests")
    .select(`
      id,
      value,
      test_date,
      heats (
        start_date,
        dogs (
          name
        )
      )
    `)
    .order("test_date", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Analytics fetch error:",
      error.message
    );

    return [];
  }

  return data ?? [];
}
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 🧠 Bridge Layer
 * A pregnancy_timeline_view SQL nézetből olvassa ki
 * az aktív vemhességeket a Dashboard, Calendar és
 * egyéb modulok számára.
 */

export async function getActivePregnancies() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return [];
  }

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
    .order("expected_whelping_date", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Bridge getActivePregnancies error:",
      error.message
    );
    return [];
  }

  return data ?? [];
}

/**
 * 🚨 Közelgő ellések
 * 7 napon belül várható ellések szűrése
 */
export async function getUrgentPregnancies() {
  const pregnancies = await getActivePregnancies();

  return pregnancies.filter((p: any) => {
    if (
      p.days_until_whelping === null ||
      p.days_until_whelping === undefined
    ) {
      return false;
    }

    return Number(p.days_until_whelping) <= 7;
  });
}

/**
 * 📅 Calendar adapter
 * A naptár oldal közvetlenül ezt használhatja.
 */
export async function getCalendarEvents() {
  const pregnancies = await getActivePregnancies();

  const events = pregnancies.flatMap((p: any) => [
    {
      id: `${p.mating_id}-ultrasound`,
      date: p.ultrasound_date,
      title: "Ultrahang",
      dogName: p.female_dog_name,
      eventType: "ultrasound",
    },
    {
      id: `${p.mating_id}-xray`,
      date: p.xray_date,
      title: "Röntgen",
      dogName: p.female_dog_name,
      eventType: "xray",
    },
    {
      id: `${p.mating_id}-whelping`,
      date: p.expected_whelping_date,
      title: "Várható ellés",
      dogName: p.female_dog_name,
      eventType: "whelping",
    },
  ]);

  return events.sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
}
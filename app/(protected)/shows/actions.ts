"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: {
  title: string;
  event_type: string;
  date: string;
  location?: string;
  judge?: string;
  entry_fee?: number;
  currency?: string;
  notes?: string;
  dog_ids?: string[];
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Nem vagy bejelentkezve!" };
  }

  // 1. Esemény beszúrása a főtáblába
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: formData.title,
      event_type: formData.event_type,
      date: formData.date,
      location: formData.location,
      judge: formData.judge,
      entry_fee: formData.entry_fee || 0,
      currency: formData.currency || "EUR",
      notes: formData.notes,
    })
    .select()
    .single();

  if (eventError) {
    return { success: false, error: eventError.message };
  }

  // 2. Kutyák összekötése az eseménnyel (Csak az event_id és dog_id mezőket küldjük a hiba elkerülésére)
  if (formData.dog_ids && formData.dog_ids.length > 0 && event) {
    const entries = formData.dog_ids.map((dogId) => ({
      event_id: event.id,
      dog_id: dogId,
    }));

    const { error: entriesError } = await supabase
      .from("event_entries")
      .insert(entries);

    if (entriesError) {
      // Ha a kapcsolótábla hibára fut, magát az eseményt már megmentettük, ne dőljön össze az egész
      console.error("Kapcsolótábla beszúrási hiba:", entriesError.message);
    }
  }

  // 3. Ha volt nevezési díj, beírjuk a pénzügyekbe (expense)
  if (formData.entry_fee && formData.entry_fee > 0) {
    await supabase.from("payments").insert({
      user_id: user.id,
      amount: formData.entry_fee,
      type: "expense",
      category: "Kiállítás / Vizsga díj",
      date: formData.date,
      description: `Nevezési díj: ${formData.title}`,
    });
  }

  // Cache frissítések kikényszerítése
  revalidatePath("/shows");
  revalidatePath("/dashboard");
  revalidatePath("/finance");

  return { success: true };
}

export async function updateEntryResultAction(
  entryId: string,
  data: {
    class_entered?: string;
    placement?: string;
    titles_won?: string;
    report_text?: string;
  }
) {
  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("event_entries")
    .update({
      class_entered: data.class_entered,
      placement: data.placement,
      titles_won: data.titles_won,
      report_text: data.report_text,
    })
    .eq("id", entryId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/shows");
  return { success: true };
}

export async function deleteEventAction(id: string) {
  const supabase = createServerSupabase();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/shows");
  revalidatePath("/dashboard");
  return { success: true };
}

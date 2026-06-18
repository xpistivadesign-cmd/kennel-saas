"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

// Új kiállítás / vizsga / verseny létrehozása
export async function createEventAction(data: {
  title: string;
  event_type: string;
  date: string;
  location: string;
  judge: string;
  entry_deadline?: string;
  entry_fee?: number;
  currency?: string;
  notes?: string;
  dog_ids: string[]; // Egyszerre több kutyát is be lehet nevezni!
}) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Nincs bejelentkezve!" };

    // 1. Esemény beszúrása
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .insert({
        user_id: user.id,
        title: data.title,
        event_type: data.event_type,
        date: data.date,
        location: data.location || null,
        judge: data.judge || null,
        entry_deadline: data.entry_deadline || null,
        entry_fee: data.entry_fee || 0,
        currency: data.currency || "EUR",
        notes: data.notes || null
      })
      .select()
      .single();

    if (eventErr) return { success: false, error: eventErr.message };

    // 2. Kutyák benevezése az eseményre
    if (data.dog_ids && data.dog_ids.length > 0) {
      const entries = data.dog_ids.map(dogId => ({
        event_id: event.id,
        dog_id: dogId
      }));
      const { error: entryErr } = await supabase.from("event_entries").insert(entries);
      if (entryErr) return { success: false, error: entryErr.message };
    }

    // 3. Automatikus Pénzügyi Könyvelés (Ha volt nevezési díj)
    if (data.entry_fee && data.entry_fee > 0) {
      await supabase.from("finances").insert({
        user_id: user.id,
        type: "expense",
        category: "Show & Entry Fees",
        amount: data.entry_fee,
        currency: data.currency || "EUR",
        description: `Nevezési díj: ${data.title}`,
        date: new Date().toISOString().split("T")[0]
      });
    }

    revalidatePath("/shows");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Eredmény frissítése a kiállítás után
export async function updateEntryResultAction(entryId: string, data: {
  class_entered?: string;
  placement?: string;
  titles_won?: string;
  report_text?: string;
}) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase
      .from("event_entries")
      .update({
        class_entered: data.class_entered,
        placement: data.placement,
        titles_won: data.titles_won,
        report_text: data.report_text
      })
      .eq("id", entryId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/shows");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteEventAction(eventId: string) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/shows");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

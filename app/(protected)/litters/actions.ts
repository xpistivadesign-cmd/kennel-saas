"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const letter = String(formData.get("letter") || "").trim();
  const birthDate = formData.get("birth_date") ? String(formData.get("birth_date")) : null;
  const rawStatus = String(formData.get("status") || "Planning");
  const formNotes = String(formData.get("notes") || "");

  // TŰPONTOS STÁTUSZ FORDÍTÁS AZ ADATBÁZISODHOZ:
  // Ha az űrlap 'Planning'-et küld, azt 'Tervezett'-ként mentjük.
  // Ha 'Born'-t vagy bármi mást, azt az adatbázisod szerinti 'Éllés'-ként mentjük.
  let dbStatus = "Éllés"; 
  if (rawStatus === "Planning" || rawStatus === "Tervezett" || rawStatus.toLowerCase() === "planning") {
    dbStatus = "Tervezett";
  } else if (rawStatus === "Born" || rawStatus === "Born/Active" || rawStatus === "Megszületett") {
    dbStatus = "Éllés";
  }

  // Mivel nincs külön letter oszlop a sémádban, a notes mezőbe mentjük el a jelet
  const combinedNotes = letter 
    ? `[Alom jele/betűje: ${letter}] ${formNotes}`.trim() 
    : formNotes;

  const payload: any = {
    birth_date: birthDate || null,
    status: dbStatus, // Most már a pontos, validált magyar szót küldjük be!
    notes: combinedNotes,
    user_id: user?.id || null,
    female_count: 0,
    male_count: 0
  };

  const { error } = await supabase.from("litters").insert(payload);

  if (error) {
    console.error("Supabase mentési hiba:", error.message);
    return redirect(`/litters?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/litters");
  return redirect("/litters");
}

export async function addPuppyAction(litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const payload = {
    litter_id: litterId,
    collar_color: String(formData.get("collar_color") || ""),
    gender: String(formData.get("gender")),
    birth_weight: parseInt(String(formData.get("birth_weight") || "0")),
    current_status: "Available"
  };
  const { error } = await supabase.from("puppies").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath(`/litters?id=${litterId}`);
}

export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));
  const collar = String(formData.get("collar_color") || "Nyakörv nélküli");

  await supabase.from("puppies").update({
    buyer_name,
    buyer_email: String(formData.get("buyer_email") || ""),
    buyer_phone: String(formData.get("buyer_phone") || ""),
    sale_price,
    current_status: "Sold"
  }).eq("id", puppyId);

  const financePayload = {
    user_id: user?.id,
    title: `Alom eladás: ${collar} kiskutya (${buyer_name})`,
    amount: sale_price,
    type: "income",
    date: new Date().toISOString().split("T")[0]
  };

  try { await supabase.from("finances").insert(financePayload); } catch (e) {
    try { await supabase.from("finance").insert(financePayload); } catch (err) {}
  }
  revalidatePath(`/litters?id=${litterId}`);
}

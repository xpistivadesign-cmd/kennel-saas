"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const letter = String(formData.get("letter") || "").trim();
  const birthDate = formData.get("birth_date") ? String(formData.get("birth_date")) : null;
  const rawStatus = String(formData.get("status") || "Tervezett").trim();
  const formNotes = String(formData.get("notes") || "");
  const sireName = formData.get("sire_name") ? String(formData.get("sire_name")).trim() : "";
  const damName = formData.get("dam_name") ? String(formData.get("dam_name")).trim() : "";
  
  let combinedNotes = `[Alom: ${letter}] ` + (sireName ? `Apa: ${sireName} ` : "") + (damName ? `Anya: ${damName} ` : "") + formNotes;

  const { error } = await supabase.from("litters").insert({
    letter: letter || null,
    birth_date: birthDate || null,
    status: rawStatus,
    notes: combinedNotes.trim() || null,
    user_id: user?.id || null,
    female_count: 0,
    male_count: 0,
    sire_name: sireName || null,
    dam_name: damName || null
  });

  if (error) return redirect(`/litters?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/litters");
  return redirect("/litters");
}

export async function markLitterAsBornAction(litterId: string, actualBirthDate: string) {
  const supabase = createSupabaseServer();
  await supabase.from("litters").update({ status: "Ellés", birth_date: actualBirthDate }).eq("id", litterId);
  revalidatePath("/litters");
}

export async function deleteLitterAction(litterId: string) {
  const supabase = createSupabaseServer();
  await supabase.from("litters").delete().eq("id", litterId);
  revalidatePath("/litters");
}

// BIZTONSÁGOS KISKUTYA MENTŐ NÉV MEZŐVEL
export async function addPuppyAction(data: { 
  litter_id: string; 
  name: string;
  collar_color: string; 
  gender: string; 
  weight_unit: string; 
  birth_weight: number 
}) {
  const supabase = createSupabaseServer();
  
  // Ha az adatbázisodban nincs 'name' oszlop, összefűzzük a nyakörvvel, 
  // így nem dob hibát a Supabase, de a név is megmarad!
  const displayName = data.name ? `${data.name} (${data.collar_color})` : data.collar_color;

  const { data: newPuppy, error } = await supabase
    .from("puppies")
    .insert({
      litter_id: data.litter_id,
      collar_color: displayName, // Itt mentjük el a nevet és a jelölést egyben
      gender: data.gender,
      birth_weight: data.birth_weight,
      weight_unit: data.weight_unit,
      status: "Elérhető"
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/litters");
  return newPuppy;
}

export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));

  await supabase.from("puppies").update({ buyer_name, sale_price, status: "Sold" }).eq("id", puppyId);
  try {
    await supabase.from("finances").insert({
      user_id: user?.id,
      title: `Kiskutya eladás (${buyer_name})`,
      amount: sale_price,
      type: "income",
      date: new Date().toISOString().split("T")[0]
    });
  } catch (e) {}
  revalidatePath("/litters");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const letter = String(formData.get("letter") || "").trim();
  const birthDate = formData.get("birth_date") ? String(formData.get("birth_date")) : null;
  const rawStatus = String(formData.get("status") || "").trim();
  const formNotes = String(formData.get("notes") || "");

  // TŰPONTOS STÁTUSZ MEGHATÁROZÁS
  let dbStatus = "Tervezett";
  if (
    rawStatus === "Born" || 
    rawStatus === "Megszületett" || 
    rawStatus === "Ellés" || 
    rawStatus.toLowerCase().includes("born") ||
    rawStatus.toLowerCase().includes("szület") ||
    rawStatus.toLowerCase().includes("ell")
  ) {
    dbStatus = "Ellés";
  }

  const sireName = formData.get("sire_name") ? String(formData.get("sire_name")).trim() : "";
  const damName = formData.get("dam_name") ? String(formData.get("dam_name")).trim() : "";
  
  let parentInfo = "";
  if (sireName) parentInfo += `Apa: ${sireName}; `;
  if (damName) parentInfo += `Anya: ${damName}; `;

  let combinedNotes = "";
  if (letter) combinedNotes += `[Alom jele/betűje: ${letter}] `;
  if (parentInfo) combinedNotes += `[Szülők - ${parentInfo.trim()}] `;
  if (formNotes) combinedNotes += formNotes;
  combinedNotes = combinedNotes.trim();

  const payload: any = {
    letter: letter || null,
    birth_date: birthDate || null,
    status: dbStatus,
    notes: combinedNotes || null,
    user_id: user?.id || null,
    female_count: 0,
    male_count: 0,
    sire_name: sireName || null,
    dam_name: damName || null
  };

  const { error } = await supabase.from("litters").insert(payload);

  if (error) {
    console.error("Supabase mentési hiba:", error.message);
    return redirect(`/litters?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/litters");
  return redirect("/litters");
}

export async function markLitterAsBornAction(litterId: string, actualBirthDate: string) {
  const supabase = createSupabaseServer();
  
  const { error } = await supabase
    .from("litters")
    .update({
      status: "Ellés",
      birth_date: actualBirthDate
    })
    .eq("id", litterId);

  if (error) throw new Error(error.message);
  revalidatePath("/litters");
}

export async function deleteLitterAction(litterId: string) {
  const supabase = createSupabaseServer();
  
  const { error } = await supabase
    .from("litters")
    .delete()
    .eq("id", litterId);

  if (error) throw new Error(error.message);
  revalidatePath("/litters");
}

export async function addPuppyAction(litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const payload = {
    litter_id: litterId,
    collar_color: String(formData.get("collar_color") || ""),
    gender: String(formData.get("gender")),
    birth_weight: parseInt(String(formData.get("birth_weight") || "0")),
    status: "Available"
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
    status: "Sold"
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

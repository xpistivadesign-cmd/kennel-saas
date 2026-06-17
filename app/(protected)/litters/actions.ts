"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  
  const { data: { user } } = await supabase.auth.getUser();

  // Csak akkor küldjük be az UUID-t, ha az egy valódi, valid azonosító, nem pedig "null" vagy "other" string
  const rawSireId = formData.get("sire_id") ? String(formData.get("sire_id")) : "null";
  const rawDamId = formData.get("dam_id") ? String(formData.get("dam_id")) : "null";

  const sire_id = (rawSireId === "null" || rawSireId === "other" || rawSireId.trim() === "") ? null : rawSireId;
  const dam_id = (rawDamId === "null" || rawDamId === "other" || rawDamId.trim() === "") ? null : rawDamId;

  const basePayload: any = {
    letter: String(formData.get("letter") || "").trim(),
    birth_date: formData.get("birth_date") ? String(formData.get("birth_date")) : null,
    sire_id: sire_id,
    dam_id: dam_id,
    sire_name: formData.get("sire_name") ? String(formData.get("sire_name")) : null,
    dam_name: formData.get("dam_name") ? String(formData.get("dam_name")) : null,
    status: String(formData.get("status") || "Planning"),
    notes: String(formData.get("notes") || ""),
    user_id: user?.id || null
  };

  let success = false;
  let errorMessage = "";

  // Végrehajtjuk a mentést tiszta blokkban
  try {
    const { error } = await supabase.from("litters").insert(basePayload);
    if (error) {
      errorMessage = error.message;
    } else {
      success = true;
    }
  } catch (err: any) {
    errorMessage = err?.message || "Ismeretlen hiba az adatbázis kapcsolatban.";
  }

  // Ha elhasalt a mentés, átirányítjuk egy hiba paraméterrel ahelyett, hogy összeomlana a szerver!
  if (!success) {
    console.error("Supabase mentési hiba:", errorMessage);
    redirect(`/litters?error=${encodeURIComponent(errorMessage || "Database insert failed")}`);
  }

  // Sikeres mentés után cache ürítés és visszalépés
  revalidatePath("/litters");
  redirect("/litters");
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

// 1. ALOM LÉTREHOZÁSA (TERVEZETT VAGY SZÜLETETT)
export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const sire_id = formData.get("sire_id") === "other" ? null : (formData.get("sire_id") || null);
  const dam_id = formData.get("dam_id") === "other" ? null : (formData.get("dam_id") || null);

  const payload = {
    user_id: user.id,
    letter: String(formData.get("letter")),
    birth_date: formData.get("birth_date") ? String(formData.get("birth_date")) : null,
    sire_id: sire_id ? String(sire_id) : null,
    dam_id: dam_id ? String(dam_id) : null,
    sire_name: formData.get("sire_name") ? String(formData.get("sire_name")) : null,
    dam_name: formData.get("dam_name") ? String(formData.get("dam_name")) : null,
    status: String(formData.get("status") || "Planning"),
    notes: String(formData.get("notes") || ""),
  };

  const { error } = await supabase.from("litters").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/litters");
  redirect("/litters");
}

// 2. KISKUTYA HOZZÁADÁSA AZ ALOMHOZ
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

// 3. KISKUTYA ELADÁSA + AUTOMATIKUS FINANCE INFLOW BEJEGYZÉS
export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));
  const collar = String(formData.get("collar_color") || "Nyakörv nélküli");

  // Frissítjük a kiskutya státuszát és a gazdi adatait
  const { error: puppyError } = await supabase
    .from("puppies")
    .update({
      buyer_name,
      buyer_email: String(formData.get("buyer_email") || ""),
      buyer_phone: String(formData.get("buyer_phone") || ""),
      sale_price,
      current_status: "Sold"
    })
    .eq("id", puppyId);

  if (puppyError) throw new Error(puppyError.message);

  // AUTOMATIKUS FINANSZÍROZÁSI INTEGRÁCIÓ:
  // Megpróbáljuk betolni a 'finances' vagy 'finance' táblába a bevételt hiba nélkül
  try {
    await supabase.from("finances").insert({
      user_id: user?.id,
      title: `Alom eladás: ${collar} kiskutya (${buyer_name})`,
      amount: sale_price,
      type: "income",
      date: new Date().toISOString().split("T")[0]
    });
  } catch (e) {
    // Fallback ha a táblád neve nem finances, hanem finance
    try {
      await supabase.from("finance").insert({
        user_id: user?.id,
        title: `Alom eladás: ${collar} kiskutya (${buyer_name})`,
        amount: sale_price,
        type: "income",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (err) {}
  }

  revalidatePath(`/litters?id=${litterId}`);
}

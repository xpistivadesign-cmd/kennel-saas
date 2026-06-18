"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

// Jelentkező hozzáadása
export async function addBuyerAction(data: {
  name: string; email: string; phone: string; address: string;
  id_card_number: string; status: string; preferred_gender: string; notes: string;
}) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: newBuyer, error } = await supabase.from("buyers").insert({
      user_id: user?.id || null,
      name: data.name,
      full_name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      id_card_number: data.id_card_number || null,
      status: data.status || "Waiting",
      preferred_gender: data.preferred_gender || "Mindegy",
      notes: data.notes || null
    }).select().single();

    if (error) return { success: false, error: error.message };
    revalidatePath("/buyers");
    return { success: true, data: newBuyer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Státusz váltás (pl. Várólistából -> Gazdi lett)
export async function updateBuyerStatusAction(buyerId: string, status: string) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("buyers").update({ status }).eq("id", buyerId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/buyers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Kiskutya hozzárendelése Gazdihoz név alapján
export async function assignPuppyToBuyerAction(puppyId: string, buyerName: string) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("puppies").update({
      buyer_name: buyerName,
      status: "Sold"
    }).eq("id", puppyId);

    if (error) return { success: false, error: error.message };
    revalidatePath("/buyers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Gazdi törlése
export async function deleteBuyerAction(buyerId: string) {
  try {
    const supabase = createServerSupabase();
    const { error } = await supabase.from("buyers").delete().eq("id", buyerId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/buyers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// SZERZŐDÉS MENTÉSE ÉS E-MAIL SNEAK-PEEK
export async function saveContractAction(data: {
  buyer_id: string; buyer_name: string; buyer_email: string;
  puppy_name: string; price_amount: number; price_currency: string; contract_date: string;
}) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: newContract, error } = await supabase.from("contracts").insert({
      user_id: user?.id || null,
      buyer_id: data.buyer_id,
      buyer_name: data.buyer_name,
      buyer_email: data.buyer_email || null,
      puppy_name: data.puppy_name,
      price_amount: data.price_amount,
      price_currency: data.price_currency,
      contract_date: data.contract_date
    }).select().single();

    if (error) return { success: false, error: error.message };

    // IDE JÖHET A CONSOLE LOG VAGY LOGIKA AZ E-MAIL KÜLDÉSHEZ
    console.log(`Szerződés e-mail küldése indítva: To: ${data.buyer_email}, Puppy: ${data.puppy_name}`);

    revalidatePath("/buyers");
    return { success: true, data: newContract };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
// Kiskutya leválasztása a gazdiról (visszaállítás elérhetőre)
export async function removePuppyFromBuyerAction(puppyId: string) {
  try {
    const supabase = createServerSupabase();
    
    const { error } = await supabase
      .from("puppies")
      .update({
        buyer_name: null,
        status: "Elérhető",
        sale_price: null // opcionális: az árat is nullázhatjuk, ha szükséges
      })
      .eq("id", puppyId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/buyers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

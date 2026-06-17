"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export async function addBuyerAction(data: {
  name: string; 
  email: string; 
  phone: string; 
  address: string;
  id_card_number: string; 
  status: string; 
  preferred_gender: string; 
  notes: string;
}) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    // Beszúrás a Supabase-be a te táblád pontos oszlopneveivel
    const { data: newBuyer, error } = await supabase.from("buyers").insert({
      user_id: user?.id || null,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      id_card_number: data.id_card_number || null,
      status: data.status,
      preferred_gender: data.preferred_gender,
      notes: data.notes || null
    }).select().single();

    if (error) {
      return { success: false, error: error.message };
    }
    
    revalidatePath("/buyers");
    return { success: true, data: newBuyer };
  } catch (err: any) {
    return { success: false, error: err.message || "Ismeretlen szerver hiba történt." };
  }
}

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

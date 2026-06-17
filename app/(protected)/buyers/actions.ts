"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function addBuyerAction(data: {
  name: string; email: string; phone: string; address: string;
  id_card_number: string; status: string; preferred_gender: string; notes: string;
}) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

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

  if (error) throw new Error(error.message);
  revalidatePath("/buyers");
  return newBuyer;
}

export async function updateBuyerStatusAction(buyerId: string, status: string) {
  const supabase = createSupabaseServer();
  const { error } = await supabase.from("buyers").update({ status }).eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath("/buyers");
}

export async function deleteBuyerAction(buyerId: string) {
  const supabase = createSupabaseServer();
  const { error } = await supabase.from("buyers").delete().eq("id", buyerId);
  if (error) throw new Error(error.message);
  revalidatePath("/buyers");
}

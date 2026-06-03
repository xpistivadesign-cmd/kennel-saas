"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 📊 FINANCE OVERVIEW
 * Bevételek + kiadások + alap aggregáció
 */
export async function getFinanceOverview() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Kölykök eladási adatai
  const { data: puppies, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      price,
      status,
      buyer_name,
      buyer_phone,
      litters (
        litter_letter
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Finance fetch error:", error.message);
    return [];
  }

  return (
    puppies?.map((p: any) => ({
      id: p.id,
      puppyName: p.name,
      litter: p.litters?.litter_letter ?? null,
      buyerName: p.buyer_name ?? null,
      buyerPhone: p.buyer_phone ?? null,
      price: p.price ?? 0,
      status: p.status ?? "unknown"
    })) ?? []
  );
}

/**
 * 📄 KUTYA ADÁSVÉTELI SZERZŐDÉS GENERÁLÁS
 */
export async function generatePuppyContract(puppyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      price,
      buyer_name,
      buyer_phone,
      buyer_address,
      litters (
        litter_letter
      )
    `)
    .eq("id", puppyId)
    .single();

  if (error || !data) {
    throw new Error("Puppy not found");
  }

  return {
    puppyName: data.name,
    litter: data.litters?.litter_letter ?? null,
    buyerName: data.buyer_name,
    buyerPhone: data.buyer_phone,
    buyerAddress: data.buyer_address,
    price: data.price
  };
}
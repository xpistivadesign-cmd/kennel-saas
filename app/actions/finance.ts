"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 📊 FINANCE OVERVIEW
 * Kölykök eladásai + bevételi adatok
 */
export async function getFinanceOverview() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      price,
      deposit_paid,
      buyer_name,
      buyer_phone,
      buyer_address,
      created_at,
      litters (
        litter_letter
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Finance overview error:", error.message);
    return [];
  }

  return (
    data?.map((p: any) => ({
      id: p.id,
      puppyName: p.name,
      litter: p.litters?.litter_letter ?? null,
      buyerName: p.buyer_name ?? null,
      buyerPhone: p.buyer_phone ?? null,
      buyerAddress: p.buyer_address ?? null,
      price: p.price ?? 0,
      deposit: p.deposit_paid ?? 0,
      remaining: (p.price ?? 0) - (p.deposit_paid ?? 0),
      date: p.created_at ?? new Date().toISOString()
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
      deposit_paid,
      buyer_name,
      buyer_phone,
      buyer_address,
      created_at,
      litters (
        litter_letter
      )
    `)
    .eq("id", puppyId)
    .single();

  if (error || !data) {
    throw new Error("Puppy not found");
  }

  const price = data.price ?? 0;
  const deposit = data.deposit_paid ?? 0;

  return {
    puppyName: data.name,
    litter: data.litters?.litter_letter ?? null,
    buyerName: data.buyer_name ?? null,
    buyerPhone: data.buyer_phone ?? null,
    buyerAddress: data.buyer_address ?? null,
    price,
    deposit,
    remaining: price - deposit,
    date: data.created_at ?? new Date().toISOString()
  };
}
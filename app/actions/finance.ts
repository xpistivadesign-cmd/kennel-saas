"use server";

import { createClient } from "@/lib/supabase/server";

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
      litters ( litter_letter )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return [];
  }

  return (
    data?.map((p: any) => ({
      id: p.id,
      puppyName: p.name,
      litter: p.litters?.litter_letter ?? null,
      buyerName: p.buyer_name ?? null,
      buyerPhone: p.buyer_phone ?? null,
      price: p.price ?? 0,
      deposit: p.deposit_paid ?? 0,
      remaining: (p.price ?? 0) - (p.deposit_paid ?? 0)
    })) ?? []
  );
}

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
      litters ( litter_letter )
    `)
    .eq("id", puppyId)
    .single();

  if (error || !data) {
    throw new Error("Puppy not found");
  }

  const deposit = data.deposit_paid ?? 0;
  const price = data.price ?? 0;

  return {
    puppyName: data.name,
    litter: data.litters?.litter_letter ?? null,
    buyerName: data.buyer_name,
    buyerPhone: data.buyer_phone,
    buyerAddress: data.buyer_address,
    price,
    deposit,
    remaining: price - deposit
  };
}
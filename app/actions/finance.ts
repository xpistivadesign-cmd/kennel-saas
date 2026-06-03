"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFinanceData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      buyer_name,
      buyer_phone,
      price,
      deposit_paid,
      litters (
        litter_letter
      )
    `);

  if (error) {
    console.error("Finance fetch error:", error.message);
    return [];
  }

  return (data ?? []).map((p) => {
    return {
      puppyName: p.name,
      litter: p.litters?.litter_letter ?? null,
      buyerName: p.buyer_name,
      buyerPhone: p.buyer_phone,
      price: p.price,
      deposit: p.deposit_paid,
    };
  });
}
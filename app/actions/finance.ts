"use server";

import { createClient } from "@/lib/supabase/server";

export async function getFinanceOverview() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Kutyák eladásai (bevétel)
  const { data: puppies } = await supabase
    .from("puppies")
    .select("id, name, price, deposit_paid, buyer_name, status");

  // Orvosi költségek (ha van ilyen táblád később bővíthető)
  // Most placeholder logika
  const totalRevenue =
    (puppies ?? []).reduce((sum, p) => {
      return sum + Number(p.price || 0);
    }, 0);

  const totalDeposits =
    (puppies ?? []).reduce((sum, p) => {
      return sum + Number(p.deposit_paid || 0);
    }, 0);

  return {
    puppies: puppies ?? [],
    totalRevenue,
    totalDeposits,
    totalBalance: totalRevenue - totalDeposits,
  };
}

/**
 * 📄 Automatikus adásvételi szerződés generátor
 */
export async function generatePuppyContract(puppyId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("puppies")
    .select(
      `
      id,
      name,
      price,
      deposit_paid,
      buyer_name,
      buyer_phone,
      litters (
        litter_letter
      )
    `
    )
    .eq("id", puppyId)
    .single();

  if (!data) return null;

  const remaining =
    Number(data.price || 0) -
    Number(data.deposit_paid || 0);

  return {
    puppyName: data.name,
    litter: data.litters?.litter_letter,
    buyerName: data.buyer_name,
    buyerPhone: data.buyer_phone,
    price: data.price,
    deposit: data.deposit_paid,
    remaining,
    date: new Date().toISOString().split("T")[0],
  };
}
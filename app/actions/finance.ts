"use server";

import { createClient } from "@/lib/supabase/server";

export type FinanceItem = {
  id: string;
  puppyName: string;
  litter: string | null;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  price: number;
  deposit: number;
  remaining: number;
  date: string;
};

export type FinanceOverview = {
  items: FinanceItem[];
  totalRevenue: number;
  totalDeposits: number;
  totalRemaining: number;
  totalBalance: number;
};

/**
 * 📊 FINANCE OVERVIEW
 */
export async function getFinanceOverview(): Promise<FinanceOverview> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      buyer_name,
      buyer_phone,
      buyer_address,
      price,
      deposit,
      created_at,
      litters ( litter_letter )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error(error?.message);

    return {
      items: [],
      totalRevenue: 0,
      totalDeposits: 0,
      totalRemaining: 0,
      totalBalance: 0,
    };
  }

  const items: FinanceItem[] = data.map((p: any) => {
    const price = Number(p.price ?? 0);
    const deposit = Number(p.deposit ?? 0);
    const remaining = price - deposit;

    // 🔥 FIX: litters is ARRAY
    const litterLetter =
      Array.isArray(p.litters) && p.litters.length > 0
        ? p.litters[0].litter_letter
        : null;

    return {
      id: p.id,
      puppyName: p.name,
      litter: litterLetter,
      buyerName: p.buyer_name ?? "",
      buyerPhone: p.buyer_phone ?? "",
      buyerAddress: p.buyer_address ?? "",
      price,
      deposit,
      remaining,
      date: p.created_at,
    };
  });

  const totalRevenue = items.reduce((s, i) => s + i.price, 0);
  const totalDeposits = items.reduce((s, i) => s + i.deposit, 0);
  const totalRemaining = items.reduce((s, i) => s + i.remaining, 0);

  return {
    items,
    totalRevenue,
    totalDeposits,
    totalRemaining,
    totalBalance: totalRevenue,
  };
}

/**
 * 📄 CONTRACT GENERATOR
 */
export async function generatePuppyContract(puppyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      buyer_name,
      buyer_phone,
      buyer_address,
      price,
      deposit,
      created_at,
      litters ( litter_letter )
    `)
    .eq("id", puppyId)
    .single();

  if (error || !data) return null;

  const price = Number(data.price ?? 0);
  const deposit = Number(data.deposit ?? 0);

  const litterLetter =
    Array.isArray(data.litters) && data.litters.length > 0
      ? data.litters[0].litter_letter
      : null;

  return {
    puppyName: data.name,
    litter: litterLetter,
    buyerName: data.buyer_name ?? "",
    buyerPhone: data.buyer_phone ?? "",
    buyerAddress: data.buyer_address ?? "",
    price,
    deposit,
    remaining: price - deposit,
    date: data.created_at,
  };
}
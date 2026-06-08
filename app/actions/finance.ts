"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  puppy_id: string | null;
  litter_id: string | null;
  female_id: string | null;
  male_id: string | null;
  notes: string | null;
  created_at: string;
  user_id: string;
};

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  puppy_id?: string | null;
  litter_id?: string | null;
  female_id?: string | null;
  male_id?: string | null;
  notes?: string;
};

/**
 * GET ALL TRANSACTIONS
 */
export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as Transaction[];
}

/**
 * CREATE TRANSACTION
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const supabase = await createClient();

  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userData?.user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userData.user.id,
      type: input.type,
      amount: input.amount,
      category: input.category,
      date: input.date,
      puppy_id: input.puppy_id ?? null,
      litter_id: input.litter_id ?? null,
      female_id: input.female_id ?? null,
      male_id: input.male_id ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create transaction");
  }

  revalidatePath("/protected/finance");

  return data as Transaction;
}

/**
 * BLOODLINE PERFORMANCE (AI BUSINESS INTELLIGENCE)
 */
export async function getBloodlinePerformance() {
  const transactions = await getTransactions();

  const litterMap: Record<string, { income: number; expense: number }> = {};
  const femaleMap: Record<string, { income: number; expense: number }> = {};
  const maleMap: Record<string, { income: number; expense: number }> = {};

  for (const t of transactions) {
    const value = t.type === "income" ? t.amount : -t.amount;

    // LITTER ROI
    if (t.litter_id) {
      if (!litterMap[t.litter_id]) {
        litterMap[t.litter_id] = { income: 0, expense: 0 };
      }
      if (t.type === "income") litterMap[t.litter_id].income += t.amount;
      else litterMap[t.litter_id].expense += t.amount;
    }

    // FEMALE ROI
    if (t.female_id) {
      if (!femaleMap[t.female_id]) {
        femaleMap[t.female_id] = { income: 0, expense: 0 };
      }
      if (t.type === "income") femaleMap[t.female_id].income += t.amount;
      else femaleMap[t.female_id].expense += t.amount;
    }

    // MALE ROI
    if (t.male_id) {
      if (!maleMap[t.male_id]) {
        maleMap[t.male_id] = { income: 0, expense: 0 };
      }
      if (t.type === "income") maleMap[t.male_id].income += t.amount;
      else maleMap[t.male_id].expense += t.amount;
    }
  }

  const enrich = (map: Record<string, { income: number; expense: number }>) =>
    Object.entries(map).map(([id, v]) => {
      const profit = v.income - v.expense;
      const roi = v.expense > 0 ? (profit / v.expense) * 100 : 100;

      return {
        id,
        income: v.income,
        expense: v.expense,
        profit,
        roi: Number(roi.toFixed(2)),
      };
    });

  return {
    litters: enrich(litterMap),
    females: enrich(femaleMap),
    males: enrich(maleMap),
  };
}

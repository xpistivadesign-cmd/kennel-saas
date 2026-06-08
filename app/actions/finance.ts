"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  notes: string | null;
  created_at: string;
};

export async function getTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []) as Transaction[];
}

export async function createTransaction(input: {
  type: TransactionType;
  amount: number;
  category: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) throw new Error("Unauthorized");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.user.id,
    type: input.type,
    amount: input.amount,
    category: input.category,
    notes: input.notes ?? null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/protected/finance");

  return { success: true };
}

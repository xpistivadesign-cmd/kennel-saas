import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  // Felhasználó ellenőrzése
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. ADATOK LEKÉRÉSE AZ RLS FALON KERESZTÜL
  const { count: totalDogs } = await supabase
    .from("dogs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { data: heats } = await supabase
    .from("heats")
    .select("*, dogs(name)")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false })
    .limit(3);

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id);

  // Pénzügyi összesítések kiszámítása
  let revenue = 0;
  let expenses = 0;

  if (payments) {
    payments.forEach((p) => {
      if (p.type === "income") revenue += p.amount;
      if (p.type === "expense") expenses += p.amount;
    });
  }

  const netProfit = revenue - expenses;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* HEADER ÉS GYORS MŰVELETEK (QUICK ACTIONS) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Breeder Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Intelligent overview of your kennel facility.</p>
        </div>
        
        {/* GYORS MŰVELETEK PANEL */}
        <div className="flex flex-wrap gap-2">
          <Link href="/dogs" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl border border-zinc-800 transition">

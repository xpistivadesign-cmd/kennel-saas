import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  // Felhasználó lekérése és ellenőrzése
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Adatok lekérése a Supabase-ből az RLS szabályoknak megfelelően
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

  // Pénzügyi mérleg kiszámítása
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
      {/* Címsor és Gyors Műveletek gombok */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Breeder Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Intelligent overview of your kennel facility.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/dogs" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl border border-zinc-800 transition">
            + Add Dog
          </Link>
          <Link href="/heats" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl border border-zinc-800 transition">
            + Log Heat
          </Link>
          <Link href="/finance" className="bg-amber-500 hover:bg-amber-600 text-black font-black text-xs uppercase px-4 py-2.5 rounded-xl transition">
            + Transaction
          </Link>
        </div>
      </div>

      {/* Intelligens Riasztások Szekció */}
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Smart Notifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h4 className="font-bold text-amber-400 text-sm">Upcoming Breeding Windows</h4>
              <p className="text-zinc-400 text-xs mt-0.5">Luna's heat cycle is approaching the optimal progesterone window. Monitor levels closely.</p>
            </div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
            <span className="text-xl">🩺</span>
            <div>
              <h4 className="font-bold text-blue-400 text-sm">Pending Veterinary Tasks</h4>
              <p className="text-zinc-400 text-xs mt-0.5">3 puppies from the current litter require microchipping and health checkups next week.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kennel Mutatók Kártyák */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Active Dogs</div>
          <div className="text-3xl font-black mt-2 text-white">{totalDogs || 0}</div>
        </div>
        <div className="bg-

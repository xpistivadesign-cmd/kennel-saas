import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
// Beimportáljuk az új, interaktív kalkulátorunkat
import GestationCalculator from "./GestationCalculator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Ezres csoportosító függvény a prémium pénzügyi megjelenítéshez
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
  };

  // 1. Aktív kutyák száma
  const { count: activeDogsCount } = await supabase
    .from("dogs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 2. Legutóbbi kutyák listája (max 3)
  const { data: latestDogs } = await supabase
    .from("dogs")
    .select("id, name, breed")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  // 3. Közelgő tüzelések (Heats)
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: upcomingHeats } = await supabase
    .from("heats")
    .select("id, start_date, dogs(name)")
    .eq("user_id", user.id)
    .gte("start_date", todayStr)
    .order("start_date", { ascending: true })
    .limit(3);

  // 4. Pénzügyi összesítések
  const { data: transactions } = await supabase
    .from("payments")
    .select("amount, type")
    .eq("user_id", user.id);

  let totalRevenue = 0;
  let totalExpenses = 0;

  transactions?.forEach((t) => {
    if (t.type === "income") totalRevenue += Number(t.amount || 0);
    if (t.type === "expense") totalExpenses += Number(t.amount || 0);
  });

  const netProfit = totalRevenue - totalExpenses;

  // 5. SÜRGŐS KÖZELGŐ ESEMÉNYEK (Mai naptól számított 7 napon belülre növelve, hogy biztosan lásd az ellést is!)
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 7);
  const limitStr = limitDate.toISOString().split("T")[0];

  const { data: urgentEvents } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_type,
      date,
      location,
      event_entries (
        dogs (
          name
        )
      )
    `)
    .eq("user_id", user.id)
    .gte("date", todayStr)
    .lte("date", limitStr)
    .order("date", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white">Breeder Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dogs" className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">+ Add Dog</Link>
          <Link href="/heats" className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">+ Log Heat</Link>
          <Link href="/finance" className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">+ Transaction</Link>
        </div>
      </div>

      {/* SÜRGŐS RIASZTÁSOK BOX */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl space-y-3">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            🚨 SÜRGŐS KÖZELGŐ ESEMÉNY / TEENDŐ!
          </h2>
          {urgentEvents.map((ev: any) => (
            <div key={ev.id} className="bg-black/40 p-3 rounded-lg border border-amber-500/20">
              <span className="text-zinc-200 font-bold text-sm">🏆 {ev.title}</span>
              <span className="text-xs text-zinc-400 ml-2">({ev.event_type})</span>
              <p className="text-xs text-zinc-400 mt-1">
                📅 Időpont: <span className="text-amber-400 font-mono font-bold">{ev.date}</span> • 📍 Helyszín: {ev.location || "Nincs megadva"}
              </p>
              <p className="text-[11px] text-zinc-500 italic mt-1">
                {ev.event_entries && ev.event_entries.length > 0 
                  ? `Benevezve: ${ev.event_entries.map((en: any) => en.dogs?.name).filter(Boolean).join(", ")}`
                  : "Nincs kutya külön hozzárendelve."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* INFÓ DOBOZOK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900/40 border border-amber-500/30 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Optimal Breeding Window</h3>
          <p className="text-zinc-400 text-xs">Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.</p>
        </div>
        <div className="bg-zinc-900/40 border border-blue-500/30 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Veterinary Tasks</h3>
          <p className="text-zinc-400 text-xs">Upcoming vaccinations and health checks require attention.</p>
        </div>
      </div>

      {/* METRIKÁK FORMÁZOTT ÖSSZEGEKKEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <span className="text-zinc-500 text-xs block">Active Dogs</span>
          <strong className="text-xl text-white font-mono">{activeDogsCount || 0}</strong>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <span className="text-emerald-500 text-xs block">Revenue</span>
          <strong className="text-xl text-emerald-400 font-mono">{formatCurrency(totalRevenue)}</strong>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <span className="text-red-500 text-xs block">Expenses</span>
          <strong className="text-xl text-red-400 font-mono">{formatCurrency(totalExpenses)}</strong>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
          <span className="text-blue-500 text-xs block">Net Profit</span>
          <strong className="text-xl text-blue-400 font-mono">{formatCurrency(netProfit)}</strong>
        </div>
      </div>

      {/* ALSÓ SZEKCIÓ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-zinc-300">Latest Dogs</h3>
          <div className="space-y-2">
            {latestDogs?.map((dog) => (
              <div key={dog.id} className="bg-zinc-900/60 p-3 rounded-lg">
                <p className="text-xs font-bold text-zinc-200">{dog.name}</p>
                <p className="text-[11px] text-zinc-500">{dog.breed}</p>
              </div>
            ))}
            {(!latestDogs || latestDogs.length === 0) && <p className="text-zinc-600 text-xs italic">No dogs added yet.</p>}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-zinc-300">Upcoming Heats</h3>
          <div className="space-y-2">
            {upcomingHeats?.map((heat: any) => {
              const dogData = heat.dogs;
              const dogName = Array.isArray(dogData) ? dogData[0]?.name : dogData?.name;
              return (
                <div key={heat.id} className="bg-zinc-900/60 p-3 rounded-lg text-xs text-zinc-400 font-mono">
                  {heat.start_date} — <span className="text-zinc-200 font-sans font-bold">{dogName || "Unknown Dog"}</span>
                </div>
              );
            })}
            {(!upcomingHeats || upcomingHeats.length === 0) && <p className="text-zinc-600 text-xs italic">No active or upcoming heats logged.</p>}
          </div>
        </div>

        {/* AZ ÚJ INTERAKTÍV KALKULÁTORUNK */}
        <GestationCalculator />
      </div>
    </div>
  );
}

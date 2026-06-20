import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import GestationCalculator from "./GestationCalculator";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  // 3. Közelgő tüzelések
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

  // 5. ÉLŐ ÁLLATORVOSI RIASZTÁSOK LEKÉRÉSE (A korábbi statikus szöveg helyett!)
  const { data: liveVetVisits } = await supabase
    .from("vet_visits")
    .select("id, purpose, date")
    .eq("user_id", user.id)
    .eq("status", "planned")
    .order("date", { ascending: true })
    .limit(2);

  // 6. Sürgős naptár események
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 7);
  const limitStr = limitDate.toISOString().split("T")[0];

  const { data: urgentEvents } = await supabase
    .from("events")
    .select(`
      id, title, event_type, date, location,
      event_entries ( dogs ( name ) )
    `)
    .eq("user_id", user.id)
    .gte("date", todayStr)
    .lte("date", limitStr)
    .order("date", { ascending: true });

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black">Breeder Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dogs" className="bg-zinc-800 hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">+ Add Dog</Link>
          <Link href="/heats" className="bg-zinc-800 hover:opacity-90 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">+ Log Heat</Link>
          <Link href="/finance" className="bg-primary-btn text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all">+ Transaction</Link>
        </div>
      </div>

      {/* SÜRGŐS RIASZTÁSOK BOX */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 space-y-3">
          <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            🚨 SÜRGŐS KÖZELGŐ ESEMÉNY / TEENDŐ!
          </h2>
          {urgentEvents.map((ev: any) => (
            <div key={ev.id} className="bg-black/40 p-3 rounded-lg border border-amber-500/10">
              <span className="text-zinc-200 font-bold text-sm">🏆 {ev.title}</span>
              <span className="text-xs opacity-40 ml-2">({ev.event_type})</span>
              <p className="text-xs opacity-60 mt-1">📅 Időpont: <span className="text-amber-400 font-mono font-bold">{ev.date}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* ARCULAT-VEZÉRELT PROGESTERONE & MEDICAL INFÓS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 border border-purple-500/20" style={{ background: "linear-gradient(135deg, var(--primary)15, transparent)" }}>
          <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Optimal Breeding Window</h3>
          <p className="text-xs opacity-70">Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.</p>
        </div>
        <div className="card p-5 border border-lime-500/20" style={{ background: "linear-gradient(135deg, var(--accent)10, transparent)" }}>
          <h3 className="text-xs font-black text-lime-400 uppercase tracking-wider mb-1">Veterinary Alerts & Tasks</h3>
          {liveVetVisits && liveVetVisits.length > 0 ? (
            <div className="space-y-1 mt-1">
              {liveVetVisits.map((v: any) => (
                <p key={v.id} className="text-xs text-white">⚠️ <span className="font-bold">{v.purpose}</span> esedékes ekkor: <span className="font-mono text-lime-400">{v.date}</span></p>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-70">Nincs elmaradt állatorvosi feladat vagy esedékes oltás.</p>
          )}
        </div>
      </div>

      {/* METRIKÁK METAMORPHOSISA: Alkalmazzuk a layout-szintű atomi kártyaosztályokat! */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 dashboard-grid">
        <div className="card widget-dogs-card p-5">
          <span className="text-xs block opacity-50">Active Dogs</span>
          <strong className="text-2xl font-mono font-black">{activeDogsCount || 0}</strong>
        </div>
        <div className="card widget-litters-card p-5">
          <span className="text-xs block opacity-50">Revenue</span>
          <strong className="text-2xl font-mono font-black">{formatCurrency(totalRevenue)}</strong>
        </div>
        <div className="card widget-heats-card p-5">
          <span className="text-xs block opacity-50">Expenses</span>
          <strong className="text-2xl font-mono font-black">{formatCurrency(totalExpenses)}</strong>
        </div>
        <div className="card widget-finance-card p-5">
          <span className="text-xs block opacity-50">Net Profit</span>
          <strong className="text-2xl font-mono font-black">{formatCurrency(netProfit)}</strong>
        </div>
      </div>

      {/* ALSÓ STRUKTURÁLIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-black opacity-80">Latest Dogs</h3>
          <div className="space-y-2">
            {latestDogs?.map((dog) => (
              <div key={dog.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                <p className="text-xs font-bold text-zinc-200">{dog.name}</p>
                <p className="text-[11px] opacity-40">{dog.breed}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-sm font-black opacity-80">Upcoming Heats</h3>
          <div className="space-y-2">
            {upcomingHeats?.map((heat: any) => {
              const dogName = Array.isArray(heat.dogs) ? heat.dogs[0]?.name : heat.dogs?.name;
              return (
                <div key={heat.id} className="bg-black/30 p-3 rounded-xl border border-white/5 text-xs font-mono">
                  {heat.start_date} — <span className="font-sans font-bold text-white">{dogName || "Unknown Dog"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* INTERAKTÍV VEMHESSÉGI PANEL */}
        <GestationCalculator />
      </div>
    </div>
  );
}

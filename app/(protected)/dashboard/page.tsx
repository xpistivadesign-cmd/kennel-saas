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

  // Adatok lekérése
  const { count: activeDogsCount } = await supabase.from("dogs").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  const { data: latestDogs } = await supabase.from("dogs").select("id, name, breed").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3);
  const todayStr = new Date().toISOString().split("T")[0];
  const { data: upcomingHeats } = await supabase.from("heats").select("id, start_date, dogs(name)").eq("user_id", user.id).gte("start_date", todayStr).order("start_date", { ascending: true }).limit(3);
  const { data: transactions } = await supabase.from("payments").select("amount, type").eq("user_id", user.id);

  let totalRevenue = 0;
  let totalExpenses = 0;
  transactions?.forEach((t) => {
    if (t.type === "income") totalRevenue += Number(t.amount || 0);
    if (t.type === "expense") totalExpenses += Number(t.amount || 0);
  });
  const netProfit = totalRevenue - totalExpenses;

  const { data: liveVetVisits } = await supabase.from("vet_visits").select("id, purpose, date").eq("user_id", user.id).eq("status", "planned").order("date", { ascending: true }).limit(2);

  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() + 7);
  const limitStr = limitDate.toISOString().split("T")[0];
  const { data: urgentEvents } = await supabase.from("events").select(`id, title, event_type, date, location, event_entries ( dogs ( name ) )`).eq("user_id", user.id).gte("date", todayStr).lte("date", limitStr).order("date", { ascending: true });

  return (
    <div className="space-y-6">
      {/* UPPER HEADER BANNER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-white tracking-tight">Breeder Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dogs" className="bg-zinc-800/80 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-md">+ Add Dog</Link>
          <Link href="/heats" className="bg-zinc-800/80 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-md">+ Log Heat</Link>
          <Link href="/finance" className="bg-lime-400 hover:opacity-90 text-black px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-text-lime-400/20 uppercase tracking-wider">+ Transaction</Link>
        </div>
      </div>

      {/* SÜRGŐS RIASZTÁSOK */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md space-y-2 shadow-2xl" style={{ boxShadow: "inset 0 0 15px rgba(245, 158, 11, 0.1)" }}>
          <h2 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">🚨 SÜRGŐS TEENDŐ!</h2>
          {urgentEvents.map((ev: any) => (
            <div key={ev.id} className="bg-black/30 p-3 rounded-xl border border-amber-500/10">
              <span className="text-zinc-200 font-bold text-sm">🏆 {ev.title}</span>
              <p className="text-xs opacity-60 mt-1">📅 Dátum: <span className="text-amber-400 font-mono font-bold">{ev.date}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* INFÓ DOBOZOK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border rounded-2xl transition-all hover:scale-[1.01]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(125,57,235,0.12) 0%, rgba(0,0,0,0.6) 100%)", 
               borderColor: "rgba(125,57,235,0.25)",
               boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)" 
             }}>
          <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Optimal Breeding Window</h3>
          <p className="text-xs opacity-70 leading-relaxed">Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.</p>
        </div>
        <div className="p-5 border rounded-2xl transition-all hover:scale-[1.01]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(198,255,51,0.08) 0%, rgba(0,0,0,0.6) 100%)", 
               borderColor: "rgba(198,255,51,0.2)",
               boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.5)" 
             }}>
          <h3 className="text-xs font-black text-lime-400 uppercase tracking-wider mb-1">Veterinary Alerts & Tasks</h3>
          {liveVetVisits && liveVetVisits.length > 0 ? (
            <div className="space-y-1 mt-1">
              {liveVetVisits.map((v: any) => (
                <p key={v.id} className="text-xs text-zinc-200">⚠️ <span className="font-bold">{v.purpose}</span> esedékes: <span className="font-mono text-lime-300">{v.date}</span></p>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-70">Nincs elmaradt állatorvosi teendőd.</p>
          )}
        </div>
      </div>

      {/* 🔮 PRÉMIUM METRIKÁK METAMORPHOSISA: 3D, lekerekített, belső árnyékos kártyák */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: VIOLET GLOW */}
        <div className="p-5 border rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(125,57,235,0.18) 0%, rgba(10,10,12,0.85) 100%)", 
               borderColor: "rgba(125,57,235,0.3)",
               boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 12px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.6)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 block mb-1 opacity-80">Active Dogs</span>
          <strong className="text-3xl font-mono font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(125,57,235,0.4)]">{activeDogsCount || 0}</strong>
        </div>

        {/* CARD 2: ELECTRIC BLUE */}
        <div className="p-5 border rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(2,63,249,0.15) 0%, rgba(8,12,18,0.85) 100%)", 
               borderColor: "rgba(2,63,249,0.3)",
               boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 12px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.6)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-400 block mb-1 opacity-80">Revenue</span>
          <strong className="text-3xl font-mono font-black text-emerald-400 tracking-tight drop-shadow-[0_2px_8px_rgba(52,211,153,0.3)]">{formatCurrency(totalRevenue)}</strong>
        </div>

        {/* CARD 3: VIVID RED/EXPENSE */}
        <div className="p-5 border rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(12,10,10,0.85) 100%)", 
               borderColor: "rgba(239,68,68,0.25)",
               boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 12px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.6)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-wider text-red-400 block mb-1 opacity-80">Expenses</span>
          <strong className="text-3xl font-mono font-black text-red-400 tracking-tight drop-shadow-[0_2px_8px_rgba(239,68,68,0.3)]">{formatCurrency(totalExpenses)}</strong>
        </div>

        {/* CARD 4: LIME/PROFIT MATRIX */}
        <div className="p-5 border rounded-2xl transition-all duration-300 hover:translate-y-[-2px]" 
             style={{ 
               background: "linear-gradient(135deg, rgba(198,255,52,0.14) 0%, rgba(10,12,10,0.85) 100%)", 
               borderColor: "rgba(198,255,52,0.25)",
               boxShadow: "inset 0 1px 2px rgba(255,255,255,0.15), inset 0 -4px 12px rgba(0,0,0,0.4), 0 12px 24px rgba(0,0,0,0.6)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-wider text-lime-400 block mb-1 opacity-80">Net Profit</span>
          <strong className="text-3xl font-mono font-black tracking-tight" style={{ color: netProfit >= 0 ? "#C6FF33" : "#EF4444", dropShadow: "0 2px 8px rgba(198,255,52,0.3)" }}>{formatCurrency(netProfit)}</strong>
        </div>

      </div>

      {/* LOWER DATA BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LATEST DOGS */}
        <div className="p-5 border rounded-2xl bg-zinc-900/20 backdrop-blur-sm space-y-3" style={{ borderColor: "var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Latest Dogs</h3>
          <div className="space-y-2">
            {latestDogs?.map((dog) => (
              <div key={dog.id} className="p-3 rounded-xl border border-white/5 bg-black/30 shadow-inner">
                <p className="text-xs font-bold text-zinc-200">{dog.name}</p>
                <p className="text-[11px] opacity-40">{dog.breed}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING HEATS */}
        <div className="p-5 border rounded-2xl bg-zinc-900/20 backdrop-blur-sm space-y-3" style={{ borderColor: "var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Upcoming Heats</h3>
          <div className="space-y-2">
            {upcomingHeats?.map((heat: any) => {
              const dogName = Array.isArray(heat.dogs) ? heat.dogs[0]?.name : heat.dogs?.name;
              return (
                <div key={heat.id} className="p-3 rounded-xl border border-white/5 bg-black/30 shadow-inner text-xs font-mono">
                  {heat.start_date} — <span className="font-sans font-bold text-white">{dogName || "Unknown Dog"}</span>
                </div>
              );
            })}
            {(!upcomingHeats || upcomingHeats.length === 0) && <p className="text-zinc-600 text-xs italic">No upcoming heats logged.</p>}
          </div>
        </div>

        {/* GESTATION CALCULATOR CONTAINER */}
        <GestationCalculator />

      </div>
    </div>
  );
}

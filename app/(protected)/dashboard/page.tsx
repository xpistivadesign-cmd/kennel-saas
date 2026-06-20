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
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md space-y-2 shadow-2xl" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.1)" }}>
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

      {/* 🔮 ULTRA 3D GRADIENT METRICS GRID (Concept 4 & Concept 2 hibrid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: ACTIVE DOGS - Deep Neon Violet 3D */}
        <div className="p-5 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:translate-y-[-4px]" 
             style={{ 
               background: "linear-gradient(145deg, #7d39eb 0%, #3b1180 100%)", 
               boxShadow: "inset 0 3px 5px rgba(255, 255, 255, 0.5), inset 0 -5px 10px rgba(0, 0, 0, 0.6), 0 15px 30px rgba(125, 57, 235, 0.35)",
               border: "1px solid rgba(255, 255, 255, 0.15)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-widest text-purple-200 block mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Active Dogs</span>
          <strong className="text-4xl font-mono font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{activeDogsCount || 0}</strong>
        </div>

        {/* CARD 2: REVENUE - Electric Blue Glow 3D */}
        <div className="p-5 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:translate-y-[-4px]" 
             style={{ 
               background: "linear-gradient(145deg, #023ff9 0%, #001ba0 100%)", 
               boxShadow: "inset 0 3px 5px rgba(255, 255, 255, 0.5), inset 0 -5px 10px rgba(0, 0, 0, 0.6), 0 15px 30px rgba(2, 63, 249, 0.35)",
               border: "1px solid rgba(255, 255, 255, 0.15)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-widest text-blue-100 block mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Revenue</span>
          <strong className="text-4xl font-mono font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{formatCurrency(totalRevenue)}</strong>
        </div>

        {/* CARD 3: EXPENSES - Vivid Crimson Volcano 3D */}
        <div className="p-5 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:translate-y-[-4px]" 
             style={{ 
               background: "linear-gradient(145deg, #ef4444 0%, #991b1b 100%)", 
               boxShadow: "inset 0 3px 5px rgba(255, 255, 255, 0.5), inset 0 -5px 10px rgba(0, 0, 0, 0.6), 0 15px 30px rgba(239, 68, 68, 0.3)",
               border: "1px solid rgba(255, 255, 255, 0.15)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-widest text-red-100 block mb-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">Expenses</span>
          <strong className="text-4xl font-mono font-black text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{formatCurrency(totalExpenses)}</strong>
        </div>

        {/* CARD 4: NET PROFIT - Radioactive Lime Matrix 3D */}
        <div className="p-5 rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:translate-y-[-4px]" 
             style={{ 
               background: netProfit >= 0 ? "linear-gradient(145deg, #bbf7d0 0%, #22c55e 100%)" : "linear-gradient(145deg, #fca5a5 0%, #dc2626 100%)", 
               boxShadow: netProfit >= 0 
                 ? "inset 0 3px 5px rgba(255, 255, 255, 0.8), inset 0 -5px 10px rgba(0, 0, 0, 0.5), 0 15px 30px rgba(34, 197, 94, 0.35)" 
                 : "inset 0 3px 5px rgba(255, 255, 255, 0.8), inset 0 -5px 10px rgba(0, 0, 0, 0.5), 0 15px 30px rgba(220, 38, 38, 0.35)",
               border: "1px solid rgba(255, 255, 255, 0.3)"
             }}>
          <span className="text-[11px] font-black uppercase tracking-widest block mb-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]" style={{ color: netProfit >= 0 ? "#14532d" : "#7f1d1d" }}>Net Profit</span>
          <strong className="text-4xl font-mono font-black tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" style={{ color: netProfit >= 0 ? "#052e16" : "#450a0a" }}>{formatCurrency(netProfit)}</strong>
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

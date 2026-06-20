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
          <Link href="/dogs" className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-zinc-800 shadow-md">+ Add Dog</Link>
          <Link href="/heats" className="bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-zinc-800 shadow-md">+ Log Heat</Link>
          <Link href="/finance" className="bg-lime-400 hover:opacity-90 text-black px-4 py-1.5 rounded-xl text-xs font-black transition-all shadow-lg uppercase tracking-wider">+ Transaction</Link>
        </div>
      </div>

      {/* SÜRGŐS RIASZTÁSOK */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-2" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.05)" }}>
          <h2 className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-2">🚨 SÜRGŐS TEENDŐ!</h2>
          {urgentEvents.map((ev: any) => (
            <div key={ev.id} className="bg-black/30 p-3 rounded-xl border border-zinc-900">
              <span className="text-zinc-200 font-bold text-sm">🏆 {ev.title}</span>
              <p className="text-xs opacity-60 mt-1">📅 Dátum: <span className="text-purple-400 font-mono font-bold">{ev.date}</span></p>
            </div>
          ))}
        </div>
      )}

      {/* INFÓ DOBOZOK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border rounded-2xl bg-zinc-950" 
             style={{ 
               borderColor: "rgba(125,57,235,0.15)",
               boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5)" 
             }}>
          <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Optimal Breeding Window</h3>
          <p className="text-xs opacity-60 leading-relaxed">Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.</p>
        </div>
        <div className="p-5 border rounded-2xl bg-zinc-950" 
             style={{ 
               borderColor: "rgba(198,255,51,0.15)",
               boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.5)" 
             }}>
          <h3 className="text-xs font-black text-lime-400 uppercase tracking-wider mb-1">Veterinary Alerts & Tasks</h3>
          {liveVetVisits && liveVetVisits.length > 0 ? (
            <div className="space-y-1 mt-1">
              {liveVetVisits.map((v: any) => (
                <p key={v.id} className="text-xs text-zinc-300">⚠️ <span className="font-bold">{v.purpose}</span> esedékes: <span className="font-mono text-lime-400">{v.date}</span></p>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-60">Nincs elmaradt állatorvosi teendőd.</p>
          )}
        </div>
      </div>

      {/* 🔮 PURE NEUMORPH 3D METRICS GRID: Éles felső fények és a te Ikon-készleted */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CARD 1: ACTIVE DOGS - Matt Violet Neumorph 3D */}
        <div className="p-5 rounded-2xl relative overflow-hidden border border-zinc-900" 
             style={{ 
               background: "#0c0d12",
               boxShadow: "inset 0 2px 3px rgba(125,57,235,0.4), inset 0 -4px 10px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.7)"
             }}>
          {/* Neon Ikon a szettedből: Dogs (Mancs) */}
          <div className="absolute top-4 right-4 text-purple-500 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26a4 4 0 0 1 3 3.74c0 .5-.15.99-.42 1.41A4 4 0 0 1 18 14c0 1.5-1 2.5-2.5 2.5h-7C7 16.5 6 15.5 6 14a4 4 0 0 1 1.42-3.59c-.27-.42-.42-.91-.42-1.41a4 4 0 0 1 3-3.74c.65-.17 1.33-.26 2-.26Z"/><circle cx="6" cy="4" r="1"/><circle cx="10" cy="2" r="1"/><circle cx="14" cy="2" r="1"/><circle cx="18" cy="4" r="1"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Active Dogs</span>
          <strong className="text-3xl font-mono font-black text-white tracking-tight">{activeDogsCount || 0}</strong>
        </div>

        {/* CARD 2: REVENUE - Matt Electric Blue Neumorph 3D */}
        <div className="p-5 rounded-2xl relative overflow-hidden border border-zinc-900" 
             style={{ 
               background: "#0c0d12",
               boxShadow: "inset 0 2px 3px rgba(2,63,249,0.4), inset 0 -4px 10px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.7)"
             }}>
          {/* Neon Ikon a szettedből: Finance ($) */}
          <div className="absolute top-4 right-4 text-blue-500 opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Revenue</span>
          <strong className="text-3xl font-mono font-black text-white tracking-tight">{formatCurrency(totalRevenue)}</strong>
        </div>

        {/* CARD 3: EXPENSES - Matt Dark Slate Neumorph 3D */}
        <div className="p-5 rounded-2xl relative overflow-hidden border border-zinc-900" 
             style={{ 
               background: "#0c0d12",
               boxShadow: "inset 0 2px 3px rgba(255,255,255,0.08), inset 0 -4px 10px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.7)"
             }}>
          {/* Neon Ikon a szettedből: Expenses (Trend le) */}
          <div className="absolute top-4 right-4 text-zinc-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Expenses</span>
          <strong className="text-3xl font-mono font-black text-zinc-400 tracking-tight">{formatCurrency(totalExpenses)}</strong>
        </div>

        {/* CARD 4: NET PROFIT - Matt Lime Highlight Neumorph 3D */}
        <div className="p-5 rounded-2xl relative overflow-hidden border border-zinc-900" 
             style={{ 
               background: "#0c0d12",
               boxShadow: netProfit >= 0 
                 ? "inset 0 2px 3px rgba(198,255,51,0.4), inset 0 -4px 10px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.7)"
                 : "inset 0 2px 3px rgba(239,68,68,0.3), inset 0 -4px 10px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.7)"
             }}>
          {/* Neon Ikon a szettedből: Analytics (Kördiagram) */}
          <div className="absolute top-4 right-4 style-core" style={{ color: netProfit >= 0 ? "#C6FF33" : "#EF4444" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Net Profit</span>
          <strong className="text-3xl font-mono font-black tracking-tight" style={{ color: netProfit >= 0 ? "#C6FF33" : "#EF4444" }}>{formatCurrency(netProfit)}</strong>
        </div>

      </div>

      {/* LOWER DATA BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LATEST DOGS */}
        <div className="p-5 border rounded-2xl bg-zinc-950 space-y-3" style={{ borderColor: "var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Latest Dogs</h3>
          <div className="space-y-2">
            {latestDogs?.map((dog) => (
              <div key={dog.id} className="p-3 rounded-xl border border-zinc-900 bg-black/40">
                <p className="text-xs font-bold text-zinc-200">{dog.name}</p>
                <p className="text-[11px] opacity-40">{dog.breed}</p>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING HEATS */}
        <div className="p-5 border rounded-2xl bg-zinc-950 space-y-3" style={{ borderColor: "var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)" }}>
          <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider">Upcoming Heats</h3>
          <div className="space-y-2">
            {upcomingHeats?.map((heat: any) => {
              const dogName = Array.isArray(heat.dogs) ? heat.dogs[0]?.name : heat.dogs?.name;
              return (
                <div key={heat.id} className="p-3 rounded-xl border border-zinc-900 bg-black/40 text-xs font-mono text-zinc-400">
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

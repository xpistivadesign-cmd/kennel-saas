import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import GestationCalculator from "./GestationCalculator";

export const dynamic = "force-dynamic";

function StatCard({
  icon,
  title,
  value,
  cardBg,
  titleColor = "rgba(255,255,255,0.6)",
  valueColor = "#ffffff",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  cardBg: string;
  titleColor?: string;
  valueColor?: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        background: cardBg,
        boxShadow: `
          inset 0 2px 4px rgba(255,255,255,.15),
          inset 0 -8px 20px rgba(0,0,0,.3),
          0 20px 45px rgba(0,0,0,.4)
        `,
        border: "1px solid var(--border)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            {/* ⚡ TŰPONTOS STÍLUS FIX: Külön span-ekre bontva, tiszta string összefűzéssel, amit a böngésző kényszerítve beolvas */}
            <p className="uppercase tracking-[0.2em] text-[10px] font-black">
              <span style={{ color: titleColor }} className="important-text">{title}</span>
            </p>
            <h2 className="mt-3 text-4xl font-black">
              <span style={{ color: valueColor }} className="important-text">{value}</span>
            </h2>
          </div>

          <div
            className="h-16 w-16 rounded-[22px] flex items-center justify-center text-xl text-white"
            style={{
              background: "var(--card-1)",
              boxShadow: `
                inset 0 2px 3px rgba(255,255,255,.05),
                inset 0 -6px 15px rgba(0,0,0,.5),
                0 8px 16px rgba(0,0,0,.3)
              `,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
      
      {/* CSS injekció, ami letarolja a globális h1, h2 elnyomásokat */}
      <style dangerouslySetInnerHTML={{ __html: `
        .important-text { color: inherit !important; }
      `}} />
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const { count } = await supabase.from("dogs").select("*", { count: "exact", head: true }).eq("user_id", user.id);
  const { data: latestDogs } = await supabase.from("dogs").select("id,name,breed").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4);

  const { data: tx } = await supabase.from("payments").select("amount,type").eq("user_id", user.id);
  let income = 0;
  let expense = 0;
  tx?.forEach((x) => {
    if (x.type === "income") income += Number(x.amount);
    if (x.type === "expense") expense += Number(x.amount);
  });
  const profit = income - expense;

  const { data: liveVetVisits } = await supabase.from("vet_visits").select("id, purpose, date").eq("user_id", user.id).eq("status", "planned").order("date", { ascending: true }).limit(1);

  // 📅 ÚJ: Lekérjük a legközelebbi, jövőbeli kiállítási eseményt a "shows" táblából
  const { data: upcomingShows } = await supabase.from("shows").select("id, title, date").eq("user_id", user.id).gte("date", new Date().toISOString().split('T')[0]).order("date", { ascending: true }).limit(1);

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-5xl font-black" style={{ color: "var(--text)" }}>Dashboard</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text)", opacity: .55 }}>Kennel control center</p>
        </div>

        <div className="flex gap-3">
          <Link href="/dogs" className="px-5 py-3 rounded-[18px] text-xs font-bold border border-zinc-800 flex items-center" style={{ background: "var(--surface)", color: "var(--text)" }}>
            + Dog
          </Link>
          <Link href="/finance" className="px-6 py-3 rounded-[18px] text-xs font-black flex items-center shadow-lg" style={{ background: "var(--accent)", color: "#000" }}>
            + Finance
          </Link>
        </div>
      </div>

      {/* ALERTS WITH UPCOMING SHOWS INTEGRATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bal oldali sáv: Ha van kiállítás, ide tesszük be, ha nincs, marad az optimal window */}
        <div className="p-5 border rounded-2xl bg-zinc-950/20" style={{ borderColor: "var(--border)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}>
          {upcomingShows && upcomingShows.length > 0 ? (
            <>
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Upcoming Show Event</h3>
              <p className="text-xs text-zinc-300">🏆 <span className="font-bold">{upcomingShows[0].title}</span> is scheduled for: <span className="font-mono text-purple-400">{upcomingShows[0].date}</span></p>
            </>
          ) : (
            <>
              <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-1">Optimal Breeding Window</h3>
              <p className="text-xs opacity-60">Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.</p>
            </>
          )}
        </div>
        
        {/* Jobb oldali sáv: Állatorvosi feladatok */}
        <div className="p-5 border rounded-2xl bg-zinc-950/20" style={{ borderColor: "var(--border)", boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)" }}>
          <h3 className="text-xs font-black text-lime-400 uppercase tracking-wider mb-1">Veterinary Alerts & Tasks</h3>
          {liveVetVisits && liveVetVisits.length > 0 ? (
            <p className="text-xs text-zinc-300">⚠️ <span className="font-bold">{liveVetVisits[0].purpose}</span> upcoming: <span className="font-mono text-lime-400">{liveVetVisits[0].date}</span></p>
          ) : (
            <p className="text-xs opacity-60">No pending veterinary actions or vaccines.</p>
          )}
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><path d="M12 5c.67 0 1.35.09 2 .26a4 4 0 0 1 3 3.74c0 .5-.15.99-.42 1.41A4 4 0 0 1 18 14c0 1.5-1 2.5-2.5 2.5h-7C7 16.5 6 15.5 6 14a4 4 0 0 1 1.42-3.59c-.27-.42-.42-.91-.42-1.41a4 4 0 0 1 3-3.74c.65-.17 1.33-.26 2-.26Z"/><circle cx="6" cy="4" r="1"/><circle cx="10" cy="2" r="1"/><circle cx="14" cy="2" r="1"/><circle cx="18" cy="4" r="1"/></svg>}
          title="Dogs"
          value={count || 0}
          cardBg="linear-gradient(145deg, #7D39EB 0%, #4c1ca6 100%)"
          titleColor="rgba(255,255,255,0.7)"
          valueColor="#ffffff"
        />

        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          title="Revenue"
          value={money(income)}
          cardBg="linear-gradient(145deg, #023FF9 0%, #01229c 100%)"
          titleColor="rgba(255,255,255,0.7)"
          valueColor="#ffffff"
        />

        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
          title="Expenses"
          value={money(expense)}
          cardBg="linear-gradient(145deg, #011A2E 0%, #000c14 100%)"
          titleColor="rgba(255,255,255,0.4)"
          valueColor="#ffffff"
        />

        <StatCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>}
          title="Profit"
          value={money(profit)}
          cardBg="linear-gradient(145deg, #C6FF33 0%, #90cf00 100%)"
          titleColor="#023FF9"
          valueColor="#023FF9"
        />
      </div>

      {/* LOWER BLOCKS */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div
          className="rounded-[30px] p-7"
          style={{
            background: "var(--card-1)",
            boxShadow: `inset 0 3px 6px rgba(255,255,255,.07), inset 0 -10px 18px rgba(0,0,0,.35), 0 20px 50px rgba(0,0,0,.35)`,
          }}
        >
          <h3 className="font-black mb-4" style={{ color: "var(--primary)" }}>Recent Dogs</h3>
          <div className="space-y-3">
            {latestDogs?.map((d) => (
              <div key={d.id} className="rounded-[22px] p-4" style={{ background: "var(--surface)" }}>
                <div className="font-black" style={{ color: "var(--text)" }}>{d.name}</div>
                <div className="text-xs" style={{ opacity: .55 }}>{d.breed}</div>
              </div>
            ))}
          </div>
        </div>

        <GestationCalculator />

        <div
          className="rounded-[30px] p-7"
          style={{
            background: "var(--card-2)",
            boxShadow: `inset 0 3px 6px rgba(255,255,255,.07), inset 0 -10px 18px rgba(0,0,0,.35), 0 20px 50px rgba(0,0,0,.35)`,
          }}
        >
          <h3 className="font-black mb-5" style={{ color: "var(--accent)" }}>Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/veterinary" className="block p-4 rounded-[20px] text-xs font-bold transition-all hover:opacity-80" style={{ background: "var(--surface)" }}>
              🩺 Veterinary Dashboard
            </Link>
            <Link href="/litters" className="block p-4 rounded-[20px] text-xs font-bold transition-all hover:opacity-80" style={{ background: "var(--surface)" }}>
              🐾 Litters Matrix
            </Link>
            <Link href="/shows" className="block p-4 rounded-[20px] text-xs font-bold transition-all hover:opacity-80" style={{ background: "var(--surface)" }}>
              📅 Events & Shows
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

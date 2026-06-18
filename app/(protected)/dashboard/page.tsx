import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Alapadatok lekérése (Kutyák, Tüzelések, Pénzügyek)
  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: heats } = await supabase
    .from("heats")
    .select("id, start_date, dogs(name)")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, type")
    .eq("user_id", user.id);

  // 2. KÖZELGŐ SHOW-K, VIZSGÁK ÉS VERSENYEK LEKÉRÉSE (Következő 3 nap szűrése)
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);

  const todayStr = today.toISOString().split("T")[0];
  const limitStr = threeDaysLater.toISOString().split("T")[0];

  const { data: urgentEvents } = await supabase
    .from("events")
    .select(`
      id,
      title,
      date,
      event_type,
      location,
      event_entries (
        dogs ( name )
      )
    `)
    .eq("user_id", user.id)
    .gte("date", todayStr)
    .lte("date", limitStr)
    .order("date", { ascending: true });

  // Pénzügyi kalkulációk
  const totalRevenue = (payments || [])
    .filter((p) => p.type === "income")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalExpenses = (payments || [])
    .filter((p) => p.type === "expense")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Breeder Dashboard</h1>

        <div className="flex gap-3">
          <Link
            href="/dogs"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition"
          >
            + Add Dog
          </Link>

          <Link
            href="/heats"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 transition"
          >
            + Log Heat
          </Link>

          <Link
            href="/finance"
            className="px-4 py-2 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 transition"
          >
            + Transaction
          </Link>
        </div>
      </div>

      {/* 🚨 ÚJ: AUTOMATIKUS KIÁLLÍTÁS ÉS MUNKAVIZSGA FIGYELMEZTETŐ DOBOZ */}
      {urgentEvents && urgentEvents.length > 0 && (
        <div className="border border-amber-500 bg-amber-950/20 rounded-xl p-5 space-y-3 animate-pulse">
          <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wide text-sm">
            <span>🚨 SÜRGŐS KÖZELGŐ ESEMÉNY / VIZSGA!</span>
          </div>
          <div className="space-y-3">
            {urgentEvents.map((ev: any) => {
              // Összegyűjtjük a benevezett kutyák neveit az eseményhez
              const dogNames = ev.event_entries?.map((entry: any) => entry.dogs?.name).filter(Boolean) || [];
              
              // Ikonok az esemény típusához a vizuális élményért
              const icon = ev.event_type === "Working Exam" ? "🦺" : ev.event_type === "Sport" ? "🏃" : ev.event_type === "Breeding Selection" ? "📐" : "🏆";

              return (
                <div key={ev.id} className="text-sm bg-black/40 border border-zinc-800/80 p-3 rounded-lg">
                  <div className="font-semibold text-zinc-100 text-base">
                    {icon} {ev.title} <span className="text-zinc-500 text-xs font-normal">({ev.event_type})</span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-1">
                    📅 Időpont: <span className="text-amber-300 font-bold">{ev.date}</span> {ev.location ? `• 📍 Helyszín: ${ev.location}` : ""}
                  </p>
                  {dogNames.length > 0 ? (
                    <p className="text-zinc-300 text-xs mt-1.5 font-medium">
                      🐕 Benevezett kutyák: <span className="text-emerald-400">{dogNames.join(", ")}</span>
                    </p>
                  ) : (
                    <p className="text-zinc-500 text-xs mt-1.5 italic">Nincs kutya külön hozzárendelve.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SMART NOTIFICATIONS */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-yellow-600 bg-yellow-900/20 rounded-xl p-4">
          <div className="font-semibold text-yellow-400">
            Optimal Breeding Window
          </div>
          <div className="text-sm text-zinc-300">
            Monitor progesterone levels between 5.0 - 10.0 ng/ml for ovulation detection.
          </div>
        </div>

        <div className="border border-blue-600 bg-blue-900/20 rounded-xl p-4">
          <div className="font-semibold text-blue-400">
            Veterinary Tasks
          </div>
          <div className="text-sm text-zinc-300">
            Upcoming vaccinations and health checks require attention.
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">Active Dogs</div>
          <div className="text-2xl font-bold">{dogs?.length || 0}</div>
        </div>

        <div className="bg-green-900/20 border border-green-700 p-4 rounded-xl">
          <div className="text-green-400 text-sm">Revenue</div>
          <div className="text-2xl font-bold">€{totalRevenue}</div>
        </div>

        <div className="bg-red-900/20 border border-red-700 p-4 rounded-xl">
          <div className="text-red-400 text-sm">Expenses</div>
          <div className="text-2xl font-bold">€{totalExpenses}</div>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-xl">
          <div className="text-blue-400 text-sm">Net Profit</div>
          <div className="text-2xl font-bold">€{netProfit}</div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* LATEST DOGS */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Latest Dogs</h2>

          {(dogs || []).slice(0, 3).map((dog) => (
            <Link
              key={dog.id}
              href={`/dogs/${dog.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition"
            >
              <div className="font-semibold">{dog.name}</div>
              <div className="text-sm text-zinc-400">{dog.breed}</div>
            </Link>
          ))}
        </div>

        {/* HEATS */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Upcoming Heats</h2>

          {(heats || []).slice(0, 3).map((heat: any) => (
            <div
              key={heat.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="font-semibold">
                {heat.start_date} — {heat.dogs?.name || "Unknown"}
              </div>
            </div>
          ))}
        </div>

        {/* GESTATION CALCULATOR */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Gestation Calculator</h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <input
              type="date"
              className="w-full bg-black border border-zinc-700 p-2 rounded text-white text-sm"
            />

            <div className="text-sm text-zinc-400 space-y-1">
              <div>Embryo Implantation: ~Day 21</div>
              <div>Fetal Heartbeat: ~Day 28</div>
              <div>Due Date: ~Day 63</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { getHeatsByDog } from "@/app/actions/heats";
import { getLitters } from "@/app/actions/litters";
import { getTransactions } from "@/app/actions/finance";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [heats, litters, transactions] = await Promise.all([
    supabase.from("heats").select("*").eq("status", "active"),
    getLitters(),
    getTransactions(),
  ]);

  const activeHeats = heats.data ?? [];

  const activeLitters = litters.filter(
    (l) => l.status === "planned" || l.status === "born"
  );

  // 📊 CURRENT MONTH FILTER
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTransactions = transactions.filter((t) => {
    return new Date(t.date) >= monthStart;
  });

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">🏡 Kennel Dashboard</h1>

      {/* KPI ROW */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active Heat Cycles
          </p>
          <p className="text-2xl font-bold">
            {activeHeats.length}
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Monthly Net Profit
          </p>
          <p
            className={`text-2xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {netProfit} HUF
          </p>
        </div>

        <div className="border rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Active / Planned Litters
          </p>
          <p className="text-2xl font-bold">
            {activeLitters.length}
          </p>
        </div>
      </div>

      {/* BREEDING ALERT */}
      <div className="border rounded-xl p-4 space-y-3">
        <h2 className="text-xl font-semibold">
          🧬 Breeding & Progesterone Monitor
        </h2>

        {activeHeats.length === 0 ? (
          <p className="text-sm text-gray-500">
            No active heats currently.
          </p>
        ) : (
          activeHeats.map(async (heat: any) => {
            const { data: tests } = await supabase
              .from("progesterone_tests")
              .select("*")
              .eq("heat_id", heat.id)
              .order("test_date", { ascending: false });

            const latest = tests?.[0];

            let message = "No progesterone data yet.";

            if (latest) {
              const value = Number(latest.value);

              if (value < 2) {
                message =
                  "EARLY STAGE → Re-test in 48 hours.";
              } else if (value >= 5 && value <= 10) {
                message =
                  "OVULATION DETECTED! Ideal mating window is NOW active.";
              } else if (value > 10) {
                message =
                  "POST-OVULATION → mating window closing.";
              } else {
                message =
                  "Monitor closely → repeat testing recommended.";
              }
            }

            return (
              <div
                key={heat.id}
                className="border p-3 rounded"
              >
                <p className="font-medium">
                  Heat ID: {heat.id}
                </p>
                <p className="text-sm text-gray-600">
                  {message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ACTIVITY + CASHFLOW */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT: BREEDING ACTIVITY */}
        <div className="border rounded-xl p-4">
          <h2 className="font-semibold mb-3">
            🐕 Recent Breeding Activity
          </h2>

          {activeHeats.slice(0, 5).map((h) => (
            <div
              key={h.id}
              className="border-b py-2 text-sm"
            >
              Heat started: {h.start_date}
            </div>
          ))}

          {activeLitters.slice(0, 5).map((l) => (
            <div
              key={l.id}
              className="border-b py-2 text-sm"
            >
              Litter: {l.id} — {l.status}
            </div>
          ))}
        </div>

        {/* RIGHT: CASHFLOW */}
        <div className="border rounded-xl p-4">
          <h2 className="font-semibold mb-3">
            💰 Cash Flow
          </h2>

          {monthlyTransactions.slice(0, 8).map((t) => (
            <div
              key={t.id}
              className="flex justify-between text-sm border-b py-2"
            >
              <span>
                {t.type.toUpperCase()} - {t.category}
              </span>

              <span
                className={
                  t.type === "income"
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {t.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

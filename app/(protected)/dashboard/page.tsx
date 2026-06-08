import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const { data: heats } = await supabase.from("heats").select("*");
  const { data: litters } = await supabase.from("litters").select("*");
  const { data: transactions } = await supabase.from("transactions").select("*");

  const activeHeats = heats?.length ?? 0;
  const totalLitters = litters?.length ?? 0;

  const netProfit =
    transactions?.reduce((acc, t: any) => {
      return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
    }, 0) ?? 0;

  const isProfitPositive = netProfit >= 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="text-sm text-zinc-400">Active Heats</div>
          <div className="text-3xl font-semibold mt-2">{activeHeats}</div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="text-sm text-zinc-400">Net Profit</div>
          <div
            className={`text-3xl font-semibold mt-2 ${
              isProfitPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            ${netProfit.toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="text-sm text-zinc-400">Litters</div>
          <div className="text-3xl font-semibold mt-2">{totalLitters}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="text-lg font-medium mb-4">Progesterone Monitor</div>
          <div className="text-sm text-zinc-400">
            Latest biological signals will appear here once heat cycles are recorded.
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="text-lg font-medium mb-4">Recent Activity</div>

          <div className="space-y-2 text-sm text-zinc-300">
            {heats?.slice(0, 5).map((h: any) => (
              <div
                key={h.id}
                className="flex justify-between border-b border-zinc-800 pb-2"
              >
                <span>Heat cycle</span>
                <span className="text-zinc-500">{h.date}</span>
              </div>
            ))}

            {(!heats || heats.length === 0) && (
              <div className="text-zinc-500">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

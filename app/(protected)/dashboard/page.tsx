import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: litters }, { data: transactions }, { data: heats }] =
    await Promise.all([
      supabase.from("litters").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("heats").select("*"),
    ]);

  const activeHeats = heats?.length ?? 0;

  const income =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((a, b) => a + Number(b.amount), 0) ?? 0;

  const expense =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((a, b) => a + Number(b.amount), 0) ?? 0;

  const net = income - expense;

  const litterCount = litters?.length ?? 0;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-white/10 rounded">
          Active Heats: {activeHeats}
        </div>
        <div className="p-4 border border-white/10 rounded">
          Net Profit: {net}
        </div>
        <div className="p-4 border border-white/10 rounded">
          Litters: {litterCount}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Recent Activity</h2>

        {transactions?.slice(0, 5).map((t) => (
          <div key={t.id} className="text-sm border-b border-white/10 py-2">
            {t.type} - {t.amount} - {t.category}
          </div>
        ))}
      </div>

      <div className="p-4 border border-yellow-500/30 rounded">
        Progesterone Monitor: Check active heats manually
      </div>
    </div>
  );
}

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

  const userId = user.id;

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, created_at")
    .eq("user_id", userId);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("user_id", userId);

  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount")
    .eq("user_id", userId);

  const totalDogs = dogs?.length ?? 0;

  const totalRevenue =
    payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const totalExpenses =
    deposits?.reduce((sum, d) => sum + Number(d.amount), 0) ?? 0;

  const netProfit = totalRevenue - totalExpenses;

  const latestDogs = dogs?.slice(-5).reverse() ?? [];

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-zinc-400">Active Dogs</div>
          <div className="text-3xl font-bold">{totalDogs}</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-zinc-400">Revenue</div>
          <div className="text-3xl font-bold text-green-400">
            €{totalRevenue}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-zinc-400">Expenses</div>
          <div className="text-3xl font-bold text-red-400">
            €{totalExpenses}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="text-zinc-400">Net Profit</div>
          <div className="text-3xl font-bold text-amber-400">
            €{netProfit}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Latest Dogs</h2>

          <div className="space-y-2">
            {latestDogs.map((d: any) => (
              <div
                key={d.id}
                className="p-3 rounded-lg bg-zinc-800"
              >
                {d.id}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-xl font-bold mb-4">Upcoming Heats</h2>

          <div className="space-y-2">
            {heats?.map((h: any) => (
              <div
                key={h.id}
                className="p-3 rounded-lg bg-zinc-800"
              >
                {h.start_date} - {h.status}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

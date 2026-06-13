import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: heats } = await supabase
    .from("heats")
    .select("id, start_date, dogs(name)")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true });

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, type")
    .eq("user_id", user.id);

  const { data: deposits } = await supabase
    .from("deposits")
    .select("amount")
    .eq("user_id", user.id);

  const totalIncome =
    (payments || [])
      .filter((p) => p.type === "income")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0) +
    (deposits || []).reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const totalExpense = (payments || [])
    .filter((p) => p.type === "expense")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="p-8 space-y-10 text-white">

      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-zinc-400 text-sm">Total Dogs</div>
          <div className="text-2xl font-bold">
            {dogs?.length || 0}
          </div>
        </div>

        <div className="bg-green-900/20 border border-green-700 rounded-xl p-5">
          <div className="text-green-400 text-sm">Total Revenue</div>
          <div className="text-2xl font-bold">
            €{totalIncome}
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-700 rounded-xl p-5">
          <div className="text-red-400 text-sm">Total Expenses</div>
          <div className="text-2xl font-bold">
            €{totalExpense}
          </div>
        </div>

      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-5">
        <div className="text-blue-400 text-sm">Net Profit</div>
        <div className="text-3xl font-bold">
          €{netProfit}
        </div>
      </div>

      {/* LATEST DOGS */}
      <div>
        <h2 className="text-xl font-bold mb-3">Latest Dogs</h2>

        <div className="grid gap-3">
          {(dogs || []).map((dog) => (
            <Link
              key={dog.id}
              href={`/dogs/${dog.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-800 transition"
            >
              <div className="text-lg font-semibold">
                {dog.name}
              </div>
              <div className="text-zinc-400 text-sm">
                {dog.breed}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* UPCOMING HEATS */}
      <div>
        <h2 className="text-xl font-bold mb-3">Upcoming Heats</h2>

        <div className="space-y-2">
          {(heats || []).map((heat: any) => (
            <div
              key={heat.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-semibold">
                  {heat.start_date} — {heat.dogs?.name || "Unknown"}
                </div>
              </div>

              <div className="text-yellow-400 text-sm">
                Heat
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addTransactionAction(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const amount = Number(formData.get("amount"));
  const type = String(formData.get("type"));
  const category = String(formData.get("category"));
  const date = String(formData.get("date"));
  const notes = String(formData.get("notes") || "");

  const { error } = await supabase.from("payments").insert({
    amount,
    type,
    category,
    date,
    notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/finance");
}

export default async function FinancePage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(10);

  const income =
    (payments || [])
      .filter((p) => p.type === "income")
      .reduce((sum, p) => sum + Number(p.amount), 0);

  const expense =
    (payments || [])
      .filter((p) => p.type === "expense")
      .reduce((sum, p) => sum + Number(p.amount), 0);

  const net = income - expense;

  return (
    <div className="space-y-10 text-white">
      <h1 className="text-3xl font-bold">Finance</h1>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-6">
          <div className="text-green-400">Total Income</div>
          <div className="text-3xl font-bold">{income}</div>
        </div>

        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6">
          <div className="text-red-400">Total Expense</div>
          <div className="text-3xl font-bold">{expense}</div>
        </div>

        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-6">
          <div className="text-blue-400">Net Profit</div>
          <div className="text-3xl font-bold">{net}</div>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {(payments || []).map((p) => (
          <div
            key={p.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 flex justify-between"
          >
            <div>
              <div className="font-semibold">
                {p.category}
              </div>
              <div className="text-sm text-zinc-400">
                {p.type} • {p.date}
              </div>
            </div>

            <div
              className={
                p.type === "income"
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {p.amount}
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <form
        action={addTransactionAction}
        className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
      >
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          className="w-full rounded-xl bg-zinc-950 p-3"
        />

        <select
          name="type"
          className="w-full rounded-xl bg-zinc-950 p-3"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          name="category"
          placeholder="Category"
          className="w-full rounded-xl bg-zinc-950 p-3"
        />

        <input
          name="date"
          type="date"
          className="w-full rounded-xl bg-zinc-950 p-3"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="w-full rounded-xl bg-zinc-950 p-3"
        />

        <button className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black">
          Log Transaction
        </button>
      </form>
    </div>
  );
}

import {
  getTransactions,
  createTransaction,
  getBloodlinePerformance,
} from "@/app/actions/finance";

export default async function FinancePage() {
  const transactions = await getTransactions();
  const bp = await getBloodlinePerformance();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">💰 Finance Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            {totalIncome}
          </p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">
            {totalExpense}
          </p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className="text-2xl font-bold text-blue-600">
            {netProfit}
          </p>
        </div>
      </div>

      {/* BLOODLINE PERFORMANCE */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          🧬 Bloodline Performance
        </h2>

        <div className="border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Litters</h3>
          {bp.litters.map((l) => (
            <div
              key={l.id}
              className="flex justify-between text-sm border-b py-1"
            >
              <span>{l.id}</span>
              <span>
                Profit: {l.profit} | ROI: {l.roi}%
              </span>
            </div>
          ))}
        </div>

        <div className="border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Females</h3>
          {bp.females.map((f) => (
            <div
              key={f.id}
              className="flex justify-between text-sm border-b py-1"
            >
              <span>{f.id}</span>
              <span>
                Profit: {f.profit} | ROI: {f.roi}%
              </span>
            </div>
          ))}
        </div>

        <div className="border rounded-xl p-4 space-y-2">
          <h3 className="font-semibold">Males</h3>
          {bp.males.map((m) => (
            <div
              key={m.id}
              className="flex justify-between text-sm border-b py-1"
            >
              <span>{m.id}</span>
              <span>
                Profit: {m.profit} | ROI: {m.roi}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TRANSACTION FORM */}
      <form
        action={async (formData) => {
          "use server";

          await createTransaction({
            type: formData.get("type") as "income" | "expense",
            amount: Number(formData.get("amount")),
            category: formData.get("category") as string,
            date: new Date(
              formData.get("date") as string
            ).toISOString(),
            litter_id:
              (formData.get("litter_id") as string) || null,
            female_id:
              (formData.get("female_id") as string) || null,
            male_id:
              (formData.get("male_id") as string) || null,
            notes: formData.get("notes") as string,
          });
        }}
        className="border p-4 rounded-xl space-y-3"
      >
        <select name="type" className="border p-2 w-full">
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          name="amount"
          type="number"
          placeholder="Amount"
          className="border p-2 w-full"
        />

        <input
          name="category"
          placeholder="Category"
          className="border p-2 w-full"
        />

        <input
          name="date"
          type="date"
          className="border p-2 w-full"
        />

        <input
          name="litter_id"
          placeholder="Litter ID (optional)"
          className="border p-2 w-full"
        />

        <input
          name="female_id"
          placeholder="Female ID (optional)"
          className="border p-2 w-full"
        />

        <input
          name="male_id"
          placeholder="Male ID (optional)"
          className="border p-2 w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Add Transaction
        </button>
      </form>

      {/* TRANSACTIONS LIST */}
      <div className="space-y-2">
        <h2 className="font-semibold">Recent Transactions</h2>

        {transactions.map((t) => (
          <div
            key={t.id}
            className="border p-3 rounded flex justify-between"
          >
            <div>
              <div className="font-medium">
                {t.type.toUpperCase()} - {t.category}
              </div>
              <div className="text-sm text-gray-500">
                {t.date}
              </div>
            </div>

            <div
              className={
                t.type === "income"
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

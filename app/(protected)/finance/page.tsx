import { createClient } from "@/utils/supabase/server";
import { calculateDebtStatus } from "@/lib/debt-ai";

export default async function FinancePage() {
  const supabase = await createClient();

  const { data: puppies } = await supabase
    .from("puppies")
    .select("*");

  const totalRevenue =
    puppies?.reduce((sum, p) => sum + (p.paid_amount || 0), 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🧾 Pénzügyi Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-xl">
          <p className="text-xs text-gray-400">Bevétel</p>
          <p className="text-xl font-bold">{totalRevenue} HUF</p>
        </div>
      </div>

      <div className="space-y-3">
        {puppies?.map((p) => {
          const status = calculateDebtStatus(p);

          return (
            <div
              key={p.id}
              className="p-4 bg-white border rounded-xl flex justify-between"
            >
              <div>
                <p className="font-bold">{p.name}</p>
                <p className="text-xs text-gray-500">
                  Ár: {p.price} / Fizetett: {p.paid_amount}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  status.severity === "red"
                    ? "bg-red-50 text-red-600"
                    : status.severity === "yellow"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
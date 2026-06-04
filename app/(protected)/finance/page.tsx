import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function FinancePage() {
  const supabase = await createClient();

  // 1. PUPPIES LEKÉRÉSE
  const { data: puppies } = await supabase
    .from("puppies")
    .select("id, name, sale_price, status, buyer_id");

  // biztonság
  const list = puppies ?? [];

  // 2. STATISZTIKÁK
  const totalExpectedRevenue = list.reduce((sum, p) => {
    return sum + (p.sale_price ?? 0);
  }, 0);

  const reservedCount = list.filter(
    (p) => p.status === "RESERVED"
  ).length;

  const soldCount = list.filter(
    (p) => p.status === "SOLD"
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">💰 Pénzügyi Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500 text-sm">Várható bevétel</p>
          <p className="text-2xl font-bold">{totalExpectedRevenue} €</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500 text-sm">Foglalások</p>
          <p className="text-2xl font-bold">{reservedCount}</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <p className="text-gray-500 text-sm">Eladott</p>
          <p className="text-2xl font-bold">{soldCount}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Név</th>
              <th className="p-3">Ár</th>
              <th className="p-3">Státusz</th>
              <th className="p-3">Művelet</th>
            </tr>
          </thead>

          <tbody>
            {list.map((puppy) => (
              <tr key={puppy.id} className="border-t">
                <td className="p-3 font-medium">{puppy.name}</td>
                <td className="p-3">
                  {puppy.sale_price ?? "—"} €
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      puppy.status === "SOLD"
                        ? "bg-green-100 text-green-700"
                        : puppy.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {puppy.status}
                  </span>
                </td>

                <td className="p-3">
                  <Link
                    href={`/finance/contract/${puppy.id}`}
                    className="bg-black text-white px-3 py-1 rounded text-sm"
                  >
                    Szerződés
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
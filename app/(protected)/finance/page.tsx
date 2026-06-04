import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function FinancePage() {
  const supabase = await createClient();

  const { data: puppies, error } = await supabase
    .from("puppies")
    .select("id, name, sale_price, status, buyer_id");

  if (error || !puppies) {
    return <div className="p-6 text-red-500">Hiba a pénzügyi adatok betöltésekor.</div>;
  }

  const totalRevenue = puppies.reduce((sum, p) => sum + (p.sale_price ?? 0), 0);

  const sold = puppies.filter(p => p.status === "sold").length;
  const reserved = puppies.filter(p => p.status === "reserved").length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">📊 Pénzügyi Dashboard</h1>

      {/* KÁRTYÁK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="p-4 bg-white border rounded shadow">
          <p className="text-sm text-gray-500">Összes bevétel</p>
          <p className="text-2xl font-bold">{totalRevenue} €</p>
        </div>

        <div className="p-4 bg-white border rounded shadow">
          <p className="text-sm text-gray-500">Eladott</p>
          <p className="text-2xl font-bold">{sold}</p>
        </div>

        <div className="p-4 bg-white border rounded shadow">
          <p className="text-sm text-gray-500">Foglalt</p>
          <p className="text-2xl font-bold">{reserved}</p>
        </div>
      </div>

      {/* TÁBLA */}
      <div className="bg-white border rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Kutya</th>
              <th className="p-3">Ár</th>
              <th className="p-3">Státusz</th>
              <th className="p-3"></th>
            </tr>
          </thead>

          <tbody>
            {puppies.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.sale_price ?? "-"} €</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3 text-right">
                  <Link
                    className="px-3 py-1 bg-black text-white rounded text-xs"
                    href={`/finance/contract/${p.id}`}
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
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function FinancePage() {
  const supabase = await createClient();

  // 🐶 KUTYÁK LEKÉRÉSE
  const { data: puppies, error } = await supabase
    .from("puppies")
    .select("id, name, sale_price, status");

  if (error || !puppies) {
    return (
      <div className="p-6 text-red-500">
        Hiba történt az adatok betöltésekor.
      </div>
    );
  }

  // 📊 SZÁMOLÁSOK
  const sold = puppies.filter(p => p.status === "sold");
  const reserved = puppies.filter(p => p.status === "reserved");

  const revenue = sold.reduce(
    (sum, p) => sum + (p.sale_price ?? 0),
    0
  );

  const deposits = reserved.reduce(
    (sum, p) => sum + (p.sale_price ?? 0) * 0.2,
    0
  );

  const totalForecast = revenue + deposits;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        💰 Pénzügyi Dashboard
      </h1>

      {/* 📊 KÁRTYÁK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Várható bevétel</p>
          <p className="text-2xl font-bold">{totalForecast} €</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Beérkezett</p>
          <p className="text-2xl font-bold">{revenue} €</p>
        </div>

        <div className="bg-white shadow rounded p-4">
          <p className="text-sm text-gray-500">Foglalások</p>
          <p className="text-2xl font-bold">{reserved.length}</p>
        </div>

      </div>

      {/* 📋 TÁBLA */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Kutya</th>
              <th className="p-3">Ár</th>
              <th className="p-3">Státusz</th>
              <th className="p-3">Szerződés</th>
            </tr>
          </thead>

          <tbody>
            {puppies.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.sale_price ?? "—"} €</td>
                <td className="p-3 capitalize">{p.status}</td>
                <td className="p-3">
                  <Link
                    href={`/finance/contract/${p.id}`}
                    className="px-3 py-1 bg-black text-white text-xs rounded"
                  >
                    Megnyitás
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
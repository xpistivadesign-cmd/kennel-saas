import { createClient } from "@/utils/supabase/server";

export default async function FinancePage() {
  const supabase = createClient();

  const { data: puppies } = await supabase
    .from("puppies")
    .select("id, name, sale_price, status, buyer_id");

  const totalRevenue =
    puppies?.reduce((sum, p) => sum + (p.sale_price || 0), 0) || 0;

  const reserved = puppies?.filter((p) => p.status === "RESERVED").length || 0;

  const sold = puppies?.filter((p) => p.status === "SOLD").length || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pénzügyek</h1>

      {/* 📊 STATS */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Összes bevétel</p>
          <p className="text-xl font-bold">{totalRevenue} €</p>
        </div>

        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Foglalva</p>
          <p className="text-xl font-bold">{reserved}</p>
        </div>

        <div className="p-4 bg-white border rounded">
          <p className="text-sm text-gray-500">Eladva</p>
          <p className="text-xl font-bold">{sold}</p>
        </div>
      </div>

      {/* 🐕 TABLE */}
      <div className="bg-white border rounded">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Név</th>
              <th className="p-2">Ár</th>
              <th className="p-2">Státusz</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {puppies?.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.sale_price} €</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">
                  <a
                    className="text-blue-600 underline"
                    href={`/finance/contract/${p.id}`}
                  >
                    Szerződés
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
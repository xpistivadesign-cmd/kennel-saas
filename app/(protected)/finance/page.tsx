import { getFinanceOverview } from "@/app/actions/finance";
import Link from "next/link";

export default async function FinancePage() {
  const data = await getFinanceOverview();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Pénzügyek 💰</h1>
        <p className="text-gray-500">
          Bevétel, kiadás és kölyök eladások követése
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-gray-500">Bevétel</div>
          <div className="text-2xl font-bold">
            {data.totalRevenue} €
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-gray-500">Foglalók</div>
          <div className="text-2xl font-bold">
            {data.totalDeposits} €
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="text-sm text-gray-500">Hátralék</div>
          <div className="text-2xl font-bold text-red-500">
            {data.totalRemaining} €
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Kölyök</th>
              <th className="text-left p-3">Alom</th>
              <th className="text-left p-3">Vevő</th>
              <th className="text-left p-3">Ár</th>
              <th className="text-left p-3">Foglaló</th>
              <th className="text-left p-3">Hátralék</th>
              <th className="text-right p-3">Szerződés</th>
            </tr>
          </thead>

          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} className="border-t">
                
                <td className="p-3 font-medium">
                  {p.puppyName}
                </td>

                <td className="p-3">
                  {p.litter ?? "-"}
                </td>

                <td className="p-3">
                  {p.buyerName ?? "-"}
                </td>

                <td className="p-3">{p.price} €</td>

                <td className="p-3">{p.deposit} €</td>

                <td className="p-3 text-red-600">
                  {p.remaining} €
                </td>

                <td className="p-3 text-right">
                  <Link
                    href={`/finance/contract/${p.id}`}
                    className="text-emerald-600 font-medium"
                  >
                    Megnyitás →
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
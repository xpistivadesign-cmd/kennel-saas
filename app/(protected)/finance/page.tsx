import { getFinanceOverview } from "@/app/actions/finance";
import Link from "next/link";

export default async function FinancePage() {
  const data = await getFinanceOverview();

  if (!data) {
    return (
      <div className="p-6 text-gray-500">
        Nincs elérhető pénzügyi adat.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Pénzügyek 💰
        </h1>
        <p className="text-gray-500">
          Bevétel, foglalók és eladások kezelése
        </p>
      </div>

      {/* KPI KÁRTYÁK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-sm">
            Teljes bevétel
          </div>
          <div className="text-2xl font-bold">
            {data.totalRevenue} €
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-sm">
            Foglalók
          </div>
          <div className="text-2xl font-bold">
            {data.totalDeposits} €
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-sm">
            Egyenleg
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {data.totalBalance} €
          </div>
        </div>
      </div>

      {/* LISTA */}
      <div className="bg-white border rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Kiskutya</th>
              <th className="p-3">Vevő</th>
              <th className="p-3">Ár</th>
              <th className="p-3">Foglaló</th>
              <th className="p-3 text-right">Szerződés</th>
            </tr>
          </thead>

          <tbody>
            {data.puppies.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.name}</td>
                <td className="p-3">
                  {p.buyer_name || "-"}
                </td>
                <td className="p-3">
                  {p.price || 0} €
                </td>
                <td className="p-3">
                  {p.deposit_paid || 0} €
                </td>
                <td className="p-3 text-right">
                  <Link
                    className="text-emerald-600 font-medium"
                    href={`/finance/contract/${p.id}`}
                  >
                    Generálás
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
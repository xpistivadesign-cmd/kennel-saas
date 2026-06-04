import { createClient } from "@/utils/supabase/server";

export default async function FinancePage() {
  const supabase = createClient();

  const { data: puppies } = await supabase
    .from("puppies")
    .select("id, name, sale_price, status");

  const totalExpected =
    puppies?.reduce((sum, p) => sum + (p.sale_price || 0), 0) || 0;

  const reserved =
    puppies?.filter((p) => p.status === "RESERVED").length || 0;

  const sold =
    puppies?.filter((p) => p.status === "SOLD").length || 0;

  const depositRevenue =
    puppies
      ?.filter((p) => p.status === "RESERVED")
      .reduce((sum, p) => sum + (p.sale_price || 0) * 0.2, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pénzügyi áttekintés</h1>

      {/* 📊 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="Várható bevétel" value={`${totalExpected} €`} />
        <Card title="Foglalók" value={`${depositRevenue.toFixed(0)} €`} />
        <Card title="Eladva" value={sold} />
        <Card title="Foglalva" value={reserved} />
      </div>

      {/* 🐕 TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="p-3">Kutya</th>
              <th>Ár</th>
              <th>Státusz</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {puppies?.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>
                <td>{p.sale_price} €</td>

                <td>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      p.status === "SOLD"
                        ? "bg-green-100 text-green-700"
                        : p.status === "RESERVED"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="text-right p-3">
                  <a
                    href={`/finance/contract/${p.id}`}
                    className="px-3 py-1 bg-black text-white rounded hover:bg-gray-800"
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

/* 🔹 UI CARD COMPONENT */
function Card({ title, value }: any) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
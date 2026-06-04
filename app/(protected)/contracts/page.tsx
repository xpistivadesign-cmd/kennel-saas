import { createClient } from "@/utils/supabase/server";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data: puppies } = await supabase
    .from("puppies")
    .select("id, name, sale_price, deposit, buyer_id")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">📄 Szerződések</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {puppies?.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 bg-white">
            <div className="font-bold">{p.name}</div>

            <div className="text-xs text-gray-500 mt-1">
              Ár: {p.sale_price} HUF
            </div>

            <div className="text-xs text-gray-500">
              Előleg: {p.deposit || 0} HUF
            </div>

            <div className="mt-3">
              {p.buyer_id ? (
                <span className="text-green-600 text-xs">Szerződött</span>
              ) : (
                <span className="text-red-500 text-xs">Nincs vevő</span>
              )}
            </div>

            <button className="mt-3 text-xs px-3 py-1 border rounded">
              Szerződés megnyitása
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
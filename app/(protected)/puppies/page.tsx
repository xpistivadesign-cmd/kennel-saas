import { createClient } from "@/lib/supabase/server";
import { deletePuppy } from "@/app/actions/puppies";

export default async function PuppiesPage() {
  const supabase = await createClient();

  const { data: puppies } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      sex,
      color,
      collar_color,
      status,
      litters (
        litter_letter
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Kölykök 🐾</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Név</th>
              <th className="p-3 text-left">Alom</th>
              <th className="p-3 text-left">Nem</th>
              <th className="p-3 text-left">Státusz</th>
              <th className="p-3 text-right">Művelet</th>
            </tr>
          </thead>

          <tbody>
            {puppies?.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.name}</td>

                <td className="p-3 text-sm text-gray-600">
                  {p.litters?.litter_letter ?? "?"}
                </td>

                <td className="p-3 text-sm capitalize">{p.sex}</td>

                <td className="p-3 text-sm">{p.status}</td>

                <td className="p-3 text-right">
                  <form action={deletePuppy}>
                    <input type="hidden" name="puppyId" value={p.id} />
                    <button className="text-red-600 text-sm">
                      Törlés
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
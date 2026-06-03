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
      <h1 className="text-3xl font-bold text-gray-900">
        Kölykök nyilvántartása 🐾
      </h1>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Név</th>
              <th className="p-4 text-left">Alom</th>
              <th className="p-4 text-left">Nem</th>
              <th className="p-4 text-left">Státusz</th>
              <th className="p-4 text-right">Művelet</th>
            </tr>
          </thead>

          <tbody>
            {puppies && puppies.length > 0 ? (
              puppies.map((p: any) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    {p.name}
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {p.litters?.litter_letter ?? "?"}
                  </td>

                  <td className="p-4 text-sm text-gray-600 capitalize">
                    {p.sex}
                  </td>

                  <td className="p-4 text-sm text-gray-600">
                    {p.status}
                  </td>

                  <td className="p-4 text-right">
                    <form action={deletePuppy}>
                      <input
                        type="hidden"
                        name="puppyId"
                        value={p.id}
                      />
                      <button
                        type="submit"
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Törlés
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400"
                >
                  Nincs még rögzített kölyök
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
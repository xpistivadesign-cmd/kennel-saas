import { createClient } from "@/lib/supabase/server";
import { createHeat } from "@/app/actions/heats";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: femaleDogs } = await supabase
    .from("dogs")
    .select("id,name")
    .eq("sex", "female")
    .order("name");

  const { data: heats } = await supabase
    .from("heats")
    .select(`
      id,
      start_date,
      end_date,
      notes,
      dogs (
        id,
        name
      )
    `)
    .order("start_date", { ascending: false });

  async function handleSubmit(formData: FormData) {
    "use server";

    const dogId = formData.get("dogId") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const notes = formData.get("notes") as string;

    await createHeat({
      dogId,
      startDate,
      endDate,
      notes,
    });
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Tüzelések
        </h1>

        <p className="text-gray-500 mt-2">
          Szukák tüzelési naplója.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Új tüzelés rögzítése
          </h2>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">
                Szuka
              </label>

              <select
                name="dogId"
                required
                className="w-full border rounded-lg p-2"
              >
                <option value="">
                  Válassz kutyát...
                </option>

                {femaleDogs?.map((dog) => (
                  <option
                    key={dog.id}
                    value={dog.id}
                  >
                    {dog.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Kezdő dátum
              </label>

              <input
                type="date"
                name="startDate"
                required
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Befejezés dátuma
              </label>

              <input
                type="date"
                name="endDate"
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Megjegyzés
              </label>

              <textarea
                name="notes"
                rows={3}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white rounded-lg p-2 hover:bg-red-700"
            >
              Mentés
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-4">
                  Kutya
                </th>

                <th className="text-left p-4">
                  Kezdet
                </th>

                <th className="text-left p-4">
                  Vége
                </th>

                <th className="text-left p-4">
                  Megjegyzés
                </th>
              </tr>
            </thead>

            <tbody>
              {heats && heats.length > 0 ? (
                heats.map((heat: any) => (
                  <tr
                    key={heat.id}
                    className="border-t"
                  >
                    <td className="p-4 font-medium">
                      {heat.dogs?.name ?? "-"}
                    </td>

                    <td className="p-4">
                      {heat.start_date}
                    </td>

                    <td className="p-4">
                      {heat.end_date ? (
                        heat.end_date
                      ) : (
                        <span className="text-red-600 font-medium">
                          Aktív
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {heat.notes || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500"
                  >
                    Nincs még rögzített tüzelés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";
import HeatsChart from "./HeatsChart";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: heats, error } = await supabase
    .from("heats")
    .select(`
      id,
      dog_id,
      start_date,
      end_date,
      progesterone_tests (
        id,
        test_date,
        value
      )
    `)
    .order("start_date", { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Hiba történt az adatok betöltésekor
      </div>
    );
  }

  const safeHeats = heats ?? [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        Tüzelési & Progeszteron elemzés
      </h1>

      {safeHeats.map((heat: any) => {
        const tests = heat.progesterone_tests ?? [];

        return (
          <div
            key={heat.id}
            className="bg-white border rounded-lg p-5 shadow"
          >
            {/* HEADER */}
            <div className="flex justify-between mb-3">
              <span className="text-xs uppercase text-gray-400 font-bold">
                Kutya ID: {heat.dog_id}
              </span>

              <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                {heat.end_date ? "Lezárult" : "Aktív"}
              </span>
            </div>

            {/* CHART */}
            <HeatsChart tests={tests} />

            {/* DÁTUMOK */}
            <p className="text-sm text-gray-600 mt-3">
              📅 {new Date(heat.start_date).toLocaleDateString("hu-HU")} →{" "}
              {heat.end_date
                ? new Date(heat.end_date).toLocaleDateString("hu-HU")
                : "folyamatban"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
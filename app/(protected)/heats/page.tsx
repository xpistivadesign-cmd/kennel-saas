import { createClient } from "@/utils/supabase/server";

export default async function HeatsPage() {
  const supabase = await createClient();

  // 🔥 HEATS + PROGESTERONE TESTS JOIN
  const { data: heats, error } = await supabase
    .from("heats")
    .select(`
      id,
      start_date,
      end_date,
      dog_id,
      progesterone_tests (
        id,
        test_date,
        value
      )
    `)
    .order("start_date", { ascending: false });

  if (error || !heats) {
    return (
      <div className="p-6 text-red-500">
        Hiba történt az adatok betöltésekor.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 font-sans">
        Tüzelési cikluskövető & Progeszteron szintek
      </h1>

      {heats.length === 0 ? (
        <p className="text-gray-500 italic">
          Még nincs rögzített tüzelési ciklus a rendszerben.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heats.map((heat: any) => {
            const relatedTests = heat.progesterone_tests ?? [];

            return (
              <div
                key={heat.id}
                className="bg-white shadow rounded-lg p-6 border border-gray-100"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-400">
                    Tüzelési Ciklus
                  </span>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-600 font-medium">
                    {heat.end_date ? "Lezárult" : "Folyamatban"}
                  </span>
                </div>

                {/* DÁTUM */}
                <p className="text-sm font-medium text-gray-700">
                  📅{" "}
                  {new Date(heat.start_date).toLocaleDateString("hu-HU")} →{" "}
                  {heat.end_date
                    ? new Date(heat.end_date).toLocaleDateString("hu-HU")
                    : "folyamatban"}
                </p>

                {/* PROGESTERONE TESTS */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 font-sans">
                    🩸 Progeszteron mérések
                  </h3>

                  {relatedTests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Nincs rögzített mérés ehhez a ciklushoz.
                    </p>
                  ) : (
                    <div className="space-y-2 mt-2">
                      {relatedTests.map((test: any) => (
                        <div
                          key={test.id}
                          className="flex justify-between items-center border-b border-white pb-1 text-xs"
                        >
                          <span className="text-gray-600">
                            {new Date(test.test_date).toLocaleDateString("hu-HU")}
                          </span>

                          <span className="font-mono font-bold text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm">
                            {test.value} ng/ml
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
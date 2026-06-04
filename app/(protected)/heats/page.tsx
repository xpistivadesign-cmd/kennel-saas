import { createClient } from "@/utils/supabase/server";

export default async function HeatsPage() {
  const supabase = await createClient();

  // 1. Tüzelések + beágyazott progeszteron mérések
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
        Hiba történt az adatok betöltésekor.
      </div>
    );
  }

  const safeHeats = heats ?? [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 font-sans">
        Tüzelési ciklusok & progeszteron mérések
      </h1>

      {safeHeats.length === 0 ? (
        <p className="text-gray-500 italic">
          Még nincs rögzített tüzelési ciklus.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safeHeats.map((heat: any) => {
            const tests = heat.progesterone_tests ?? [];

            return (
              <div
                key={heat.id}
                className="bg-white border rounded-lg shadow p-5"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs uppercase font-bold text-gray-400">
                    Tüzelés
                  </span>

                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      heat.end_date
                        ? "bg-gray-100 text-gray-600"
                        : "bg-pink-100 text-pink-600"
                    }`}
                  >
                    {heat.end_date ? "Lezárult" : "Aktív"}
                  </span>
                </div>

                {/* DÁTUMOK */}
                <p className="text-sm text-gray-700">
                  📅{" "}
                  {new Date(heat.start_date).toLocaleDateString("hu-HU")}
                  {" → "}
                  {heat.end_date
                    ? new Date(heat.end_date).toLocaleDateString("hu-HU")
                    : "folyamatban"}
                </p>

                {/* DOG ID */}
                <p className="text-xs text-gray-400 mt-1">
                  Kutya ID: {heat.dog_id}
                </p>

                {/* PROGESZTERON BLOKK */}
                <div className="mt-4">
                  <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">
                    Progeszteron mérések
                  </h3>

                  {tests.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Nincs mérés ehhez a ciklushoz.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tests.map((t: any) => (
                        <div
                          key={t.id}
                          className="flex justify-between text-sm border-b pb-1"
                        >
                          <span className="text-gray-600">
                            {new Date(t.test_date).toLocaleDateString("hu-HU")}
                          </span>

                          <span className="font-mono font-bold">
                            {t.value} ng/ml
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
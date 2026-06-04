import { createClient } from "@/utils/supabase/server";

export default async function BreedingPlanner() {
  const supabase = await createClient();

  // 🔥 HEATS LEKÉRÉSE
  const { data: heats, error } = await supabase
    .from("heats")
    .select("id, start_date, end_date, dog_id")
    .order("start_date", { ascending: false });

  if (error || !heats) {
    return (
      <div className="p-6 text-red-500">
        Hiba történt az adatok betöltésekor.
      </div>
    );
  }

  // 📆 MAI NAP NORMALIZÁLVA
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 font-sans">
        Párosítási & Ellési Tervező
      </h1>

      {heats.length === 0 ? (
        <p className="text-gray-500 italic">
          Még nincs rögzített adat a tervezéshez.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heats.map((heat: any) => {
            // 🐕 Fedeztetés / start date
            const matingDate = new Date(heat.start_date);

            // 📅 +63 nap (natív JS, nincs külső lib)
            const dueDate = new Date(matingDate);
            dueDate.setDate(dueDate.getDate() + 63);

            // ⏳ különbség napokban
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div
                key={heat.id}
                className="bg-white shadow rounded-lg p-5 border border-gray-100 flex flex-col justify-between"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                    Várható Alom
                  </span>

                  <span className="text-xs text-gray-400 font-mono">
                    {heat.id.slice(0, 8)}
                  </span>
                </div>

                {/* DATA */}
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-900">🐕 Kutya ID:</span>{" "}
                    {heat.dog_id.slice(0, 8)}
                  </p>

                  <p>
                    ❤️{" "}
                    <span className="font-medium text-gray-900">
                      Fedeztetés:
                    </span>{" "}
                    {matingDate.toLocaleDateString("hu-HU")}
                  </p>

                  <p>
                    📅{" "}
                    <span className="font-medium text-gray-900">
                      Várható ellés:
                    </span>{" "}
                    {dueDate.toLocaleDateString("hu-HU")}
                  </p>
                </div>

                {/* STATUS */}
                <div className="mt-4 pt-3 border-t border-gray-50">
                  {diffDays > 0 ? (
                    <p className="text-sm font-bold text-amber-600">
                      ⏳ Hátralévő idő: {diffDays} nap
                    </p>
                  ) : diffDays === 0 ? (
                    <p className="text-sm font-bold text-green-600 animate-pulse">
                      🎉 Ellés MA várható!
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      ✓ Ellés megtörtént ({Math.abs(diffDays)} napja)
                    </p>
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
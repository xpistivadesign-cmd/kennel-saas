import { createClient } from "@/utils/supabase/server";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: heats, error } = await supabase
    .from("heats")
    .select(
      `
      id,
      start_date,
      end_date,
      dog_id,
      progesterone_tests (
        id,
        test_date,
        value
      )
    `
    )
    .order("start_date", { ascending: false });

  if (error || !heats) {
    return (
      <div className="p-6 text-red-500">
        Hiba az adatok betöltésekor
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tüzelési ciklusok</h1>

      {heats.length === 0 ? (
        <p className="text-gray-500">Nincs adat</p>
      ) : (
        heats.map((heat) => {
          const tests = heat.progesterone_tests || [];

          return (
            <div
              key={heat.id}
              className="border rounded-xl p-4 bg-white"
            >
              <div className="text-xs text-gray-400">
                Kutya: {heat.dog_id.slice(0, 8)}
              </div>

              <div className="text-sm mt-2">
                📅 {new Date(heat.start_date).toLocaleDateString("hu-HU")}
              </div>

              <div className="text-xs mt-2 text-gray-500">
                Mérések: {tests.length}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
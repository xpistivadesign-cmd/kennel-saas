import { createClient } from "@/lib/supabase/server";
import { getPregnancyReminders } from "@/app/actions/reminders";

export default async function DashboardPage() {
  const supabase = await createClient();

  const reminders = await getPregnancyReminders();

  const { count: totalDogs } = await supabase
    .from("dogs")
    .select("*", { count: "exact", head: true });

  const { count: activeHeats } = await supabase
    .from("heats")
    .select("*", { count: "exact", head: true })
    .is("end_date", null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Kennel Dashboard 🏛️</h1>
        <p className="text-gray-500">
          Intelligens tenyésztési monitoring rendszer
        </p>
      </div>

      {/* 🚨 SMART REMINDERS */}
      {reminders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2 uppercase tracking-wider">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            Vemhességi Emlékeztetők
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reminders.map((r: any) => (
              <div
                key={r.mating_id}
                className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4"
              >
                {/* HEADER */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">
                      {r.female_dog_name} vemhessége
                    </h3>
                    <p className="text-xs text-gray-400">
                      Pároztatás:{" "}
                      {new Date(r.first_mating_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                    {r.days_until_whelping} nap
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span>🧬 Ultrahang</span>
                    <span className="font-medium">
                      {r.ultrasound_date}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>🩻 Röntgen</span>
                    <span className="font-medium">{r.xray_date}</span>
                  </div>

                  <div className="flex justify-between text-sm bg-red-50 p-2 rounded-lg">
                    <span className="text-red-700 font-medium">
                      🍼 Várható ellés
                    </span>
                    <span className="font-bold text-red-700">
                      {r.expected_whelping_date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Összes kutya</div>
          <div className="text-3xl font-bold">{totalDogs ?? 0}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Aktív tüzelések</div>
          <div className="text-3xl font-bold text-red-600">
            {activeHeats ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
import { createClient } from "@/lib/supabase/server";
import { getActivePregnancies } from "@/app/actions/bridge";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const pregnancies = await getActivePregnancies();

  const { count: totalDogs } = await supabase
    .from("dogs")
    .select("*", { count: "exact", head: true });

  const { count: activeHeats } = await supabase
    .from("heats")
    .select("*", { count: "exact", head: true })
    .is("end_date", null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Kennel Dashboard 🏛️
        </h1>
        <p className="text-gray-500">
          Intelligens tenyésztési rendszer
        </p>
      </div>

      {/* 🐶 ACTIVE PREGNANCIES */}
      {pregnancies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-red-600">
            Aktív vemhességek
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {pregnancies.map((p: any) => (
              <div
                key={p.mating_id}
                className="bg-white border rounded-xl p-5 shadow-sm space-y-3"
              >
                {/* HEADER ROW */}
                <div className="flex justify-between">
                  <div>
                    <div className="font-bold text-gray-900">
                      {p.female_dog_name ?? "Ismeretlen szuka"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pároztatás: {p.first_mating_date}
                    </div>
                  </div>

                  <div className="text-sm font-bold text-red-600">
                    {p.days_until_whelping} nap
                  </div>
                </div>

                {/* TIMELINE */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div>🧬 UH: {p.ultrasound_date}</div>
                  <div>🩻 RTG: {p.xray_date}</div>
                  <div className="text-red-600 font-semibold">
                    🍼 Ellés: {p.expected_whelping_date}
                  </div>
                </div>

                {/* ✅ FIXED NEXT.JS LINK (BACKTICK SAFE) */}
                <Link
                  href={`/litters/generator/${p.mating_id}`}
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Megszületett az alom 🐾
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 📊 STATS SECTION */}
      <div className="grid md:grid-cols-3 gap-4 pt-6 border-t">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Összes kutya</div>
          <div className="text-2xl font-bold">
            {totalDogs ?? 0}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">
            Aktív tüzelések
          </div>
          <div className="text-2xl font-bold text-red-600">
            {activeHeats ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
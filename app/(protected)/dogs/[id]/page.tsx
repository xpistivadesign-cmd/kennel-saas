import { createClient } from "@/utils/supabase/server";

export default async function DogPage({
  params,
}: {
  params: { dogId: string };
}) {
  const supabase = createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .eq("id", params.dogId)
    .single();

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", params.dogId)
    .order("start_date", { ascending: false });

  const { data: tests } = await supabase
    .from("progesterone_tests")
    .select("*")
    .eq("dog_id", params.dogId)
    .order("test_date", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{dog?.name} – reprodukció</h1>

      {/* 🔥 HEATS TIMELINE */}
      <div className="mb-8">
        <h2 className="font-bold mb-3">Tüzelési ciklusok</h2>

        <div className="space-y-3">
          {heats?.map((h) => (
            <div
              key={h.id}
              className="p-4 border rounded-lg bg-white flex justify-between"
            >
              <div>
                <p className="font-medium">Tüzelés</p>
                <p className="text-sm text-gray-500">
                  {h.start_date} → {h.end_date}
                </p>
              </div>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {h.status || "active"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🧪 PROGESTERON TIMELINE */}
      <div>
        <h2 className="font-bold mb-3">Progesteron szintek</h2>

        <div className="space-y-3">
          {tests?.map((t) => (
            <div
              key={t.id}
              className="p-4 border rounded-lg bg-white flex justify-between"
            >
              <div>
                <p className="font-medium">{t.value} ng/ml</p>
                <p className="text-sm text-gray-500">{t.test_date}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  t.value >= 10
                    ? "bg-red-100 text-red-700"
                    : t.value >= 5
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {t.value >= 10
                  ? "Ovuláció közel"
                  : t.value >= 5
                  ? "emelkedik"
                  : "alap"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import { createClient } from "@/utils/supabase/server";

export default async function DogPage({
  params,
}: {
  params: { dogId: string };
}) {
  const supabase = createClient();

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">Reprodukciós timeline</h1>

      {/* 🔥 HEATS */}
      <h2 className="font-bold mb-2">Tüzelések</h2>
      <ul className="mb-6">
        {heats?.map((h) => (
          <li key={h.id} className="border-b py-2">
            {h.start_date} → {h.end_date}
          </li>
        ))}
      </ul>

      {/* 🧪 PROGESTERON */}
      <h2 className="font-bold mb-2">Progesteron tesztek</h2>
      <ul>
        {tests?.map((t) => (
          <li key={t.id} className="border-b py-2">
            {t.test_date} — {t.value} ng/ml
          </li>
        ))}
      </ul>
    </div>
  );
}
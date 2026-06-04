import { createClient } from "@/utils/supabase/server";

export default async function BreedingAIPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed");

  if (!dogs) {
    return <div>Nincs adat</div>;
  }

  // 🧠 egyszerű kompatibilitási logika
  const suggestions = [];

  for (let i = 0; i < dogs.length; i++) {
    for (let j = i + 1; j < dogs.length; j++) {
      const a = dogs[i];
      const b = dogs[j];

      if (a.breed === b.breed) {
        suggestions.push({
          a,
          b,
          score: 90,
          reason: "azonos fajta – stabil genetikai párosítás",
        });
      } else {
        suggestions.push({
          a,
          b,
          score: 60,
          reason: "vegyes párosítás – genetikai diverzitás",
        });
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">🧬 Párosítási AI</h1>

      {suggestions.map((s, idx) => (
        <div key={idx} className="border rounded-xl p-4 bg-white">
          <div className="font-bold">
            {s.a.name} × {s.b.name}
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Score: {s.score}%
          </div>

          <div className="text-xs text-gray-400">
            {s.reason}
          </div>
        </div>
      ))}
    </div>
  );
}
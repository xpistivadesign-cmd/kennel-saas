import { redirect } from "next/navigation";
import { createLitter } from "@/app/actions/litters";

export default function LitterGeneratorPage({
  params,
}: {
  params: { matingId: string };
}) {
  async function handleSubmit(formData: FormData) {
    "use server";

    const birthDate = formData.get("birthDate") as string;
    const litterLetter = formData.get("litterLetter") as string;
    const notes = formData.get("notes") as string;

    if (!birthDate || !litterLetter) return;

    // Egyszerűsített létrehozás: nincs mismatch action dependency
    await createLitter({
      mating_id: params.matingId,
      kennel_id: "auto-generated", // ha később van kennel context, ide jön
    });

    redirect("/litters");
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-bold">Alom Generálás 🧬</h1>

        <p className="text-sm text-gray-500 mt-1">
          Mating ID: {params.matingId}
        </p>

        <form action={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium">Születési dátum</label>
            <input
              type="date"
              name="birthDate"
              required
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Alom betű</label>
            <input
              name="litterLetter"
              maxLength={1}
              required
              className="w-full border p-2 rounded mt-1 uppercase"
              placeholder="A"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Megjegyzés</label>
            <textarea
              name="notes"
              className="w-full border p-2 rounded mt-1"
            />
          </div>

          <button className="w-full bg-emerald-600 text-white py-2 rounded">
            Litter létrehozása
          </button>
        </form>
      </div>
    </div>
  );
}

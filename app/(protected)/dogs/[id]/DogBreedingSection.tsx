"use client";

import { addHeatCycleAction } from "./actions";

type Props = {
  dogId: string;
  heatCycles: any[];
  progesteroneTests: any[];
  matings: any[];
};

export default function DogBreedingSection({
  dogId,
  heatCycles,
  progesteroneTests,
  matings,
}: Props) {
  return (
    <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 space-y-4">
      <h2 className="text-amber-400 font-bold">Breeding</h2>

      {/* HEAT FORM */}
      <form action={addHeatCycleAction.bind(null, dogId)} className="grid gap-3">
        <input name="start_date" type="date" required />
        <textarea name="notes" placeholder="Notes" />
        <button className="bg-amber-500 text-black p-2 rounded">
          Add Heat Cycle
        </button>
      </form>

      {/* LIST */}
      <div className="text-sm space-y-2">
        {heatCycles.map((h) => (
          <div key={h.id}>
            {h.start_date} — {h.notes}
          </div>
        ))}
      </div>
    </div>
  );
}

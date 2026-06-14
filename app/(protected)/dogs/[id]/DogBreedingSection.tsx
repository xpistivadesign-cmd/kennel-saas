"use client";

import {
  addHeatCycleAction,
  addProgesteroneTestAction,
  addMatingAction,
} from "./actions";

interface Props {
  dogId: string;
  heatCycles: any[];
  progesteroneTests: any[];
  matings: any[];
}

export default function DogBreedingSection({
  dogId,
  heatCycles,
  progesteroneTests,
  matings,
}: Props) {
  return (
    <div className="space-y-6">

      {/* HEAT CYCLE */}
      <div className="bg-zinc-900 p-4 rounded-xl">
        <h3 className="font-bold mb-2">Heat Cycles</h3>

        <form action={addHeatCycleAction.bind(null, dogId)} className="flex gap-2">
          <input name="start_date" type="date" className="text-black" />
          <input name="notes" placeholder="Notes" className="text-black" />
          <button className="bg-pink-500 px-3 py-1 rounded">
            Add
          </button>
        </form>

        <div className="mt-3 space-y-1">
          {heatCycles?.map((h) => (
            <div key={h.id} className="text-sm text-zinc-300">
              {h.start_date} — {h.notes}
            </div>
          ))}
        </div>
      </div>

      {/* PROGESTERONE */}
      <div className="bg-zinc-900 p-4 rounded-xl">
        <h3 className="font-bold mb-2">Progesterone Tests</h3>

        <form
          action={addProgesteroneTestAction.bind(null, dogId)}
          className="flex gap-2"
        >
          <input name="date" type="date" className="text-black" />
          <input name="value" type="number" step="0.1" className="text-black" />
          <input name="notes" placeholder="Notes" className="text-black" />
          <button className="bg-blue-500 px-3 py-1 rounded">
            Add
          </button>
        </form>

        <div className="mt-3 space-y-1">
          {progesteroneTests?.map((p) => (
            <div key={p.id} className="text-sm text-zinc-300">
              {p.date} — {p.value}
            </div>
          ))}
        </div>
      </div>

      {/* MATINGS */}
      <div className="bg-zinc-900 p-4 rounded-xl">
        <h3 className="font-bold mb-2">Matings</h3>

        <form
          action={addMatingAction.bind(null, dogId)}
          className="flex gap-2"
        >
          <input name="male_name" placeholder="Male name" className="text-black" />
          <input name="date" type="date" className="text-black" />
          <input name="notes" placeholder="Notes" className="text-black" />
          <button className="bg-green-500 px-3 py-1 rounded">
            Add
          </button>
        </form>

        <div className="mt-3 space-y-1">
          {matings?.map((m) => (
            <div key={m.id} className="text-sm text-zinc-300">
              {m.date} — {m.male_name}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

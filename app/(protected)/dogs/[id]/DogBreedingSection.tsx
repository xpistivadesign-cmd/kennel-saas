"use client";

import { useMemo, useState } from "react";
import {
  addHeatCycleAction,
  addMatingAction,
  addLitterAction,
} from "./actions";

type Heat = {
  id: string;
  start_date: string;
  progesterone: number;
  notes: string | null;
};

type Mating = {
  id: string;
  date: string;
  male_name: string;
  notes: string | null;
};

type Props = {
  dogId: string;
  heatCycles: Heat[];
  matings?: Mating[];
};

export default function DogBreedingSection({
  dogId,
  heatCycles,
  matings = [],
}: Props) {
  const [heats] = useState<Heat[]>(heatCycles);
  const [matingList] = useState<Mating[]>(matings);

  const latest = useMemo(() => {
    if (!heats.length) return null;
    return [...heats].sort(
      (a, b) =>
        new Date(b.start_date).getTime() -
        new Date(a.start_date).getTime()
    )[0];
  }, [heats]);

  const optimal =
    latest &&
    latest.progesterone >= 5 &&
    latest.progesterone <= 10;

  return (
    <div className="space-y-10 text-white">

      {optimal && (
        <div className="p-4 border border-emerald-500 bg-emerald-500/10">
          OPTIMAL BREEDING WINDOW
        </div>
      )}

      {/* HEAT */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h2 className="text-amber-400 mb-4">Heat Cycle</h2>

        <form
          action={addHeatCycleAction}
          className="grid gap-3"
        >
          <input type="hidden" name="dog_id" value={dogId} />

          <input name="start_date" type="date" required />
          <input name="progesterone" type="number" step="0.1" required />
          <textarea name="notes" placeholder="Notes" />

          <button type="submit">Save Heat</button>
        </form>

        {heats.map((h) => (
          <div key={h.id}>
            {h.start_date} - {h.progesterone} ng/ml
          </div>
        ))}
      </div>

      {/* MATING */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h2>Mating</h2>

        <form action={addMatingAction} className="grid gap-3">
          <input type="hidden" name="female_id" value={dogId} />

          <input name="date" type="date" required />
          <input name="male_name" type="text" required />
          <textarea name="notes" />

          <button type="submit">Save Mating</button>
        </form>

        {matingList.map((m) => (
          <div key={m.id}>
            {m.date} - {m.male_name}
          </div>
        ))}
      </div>

      {/* LITTER */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h2>Litter</h2>

        <form action={addLitterAction} className="grid gap-3">
          <input type="hidden" name="female_id" value={dogId} />

          <input name="birth_date" type="date" required />
          <input name="live_puppies" type="number" />
          <input name="dead_puppies" type="number" />

          <button type="submit">Register Litter</button>
        </form>
      </div>
    </div>
  );
}

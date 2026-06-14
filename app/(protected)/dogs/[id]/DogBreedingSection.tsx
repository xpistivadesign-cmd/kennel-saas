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

  const latest = useMemo(() => {
    if (!heats.length) return null;

    return heats
      .slice()
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() -
          new Date(a.start_date).getTime()
      )[0];
  }, [heats]);

  const optimalWindow =
    latest &&
    latest.progesterone >= 5 &&
    latest.progesterone <= 10;

  return (
    <div className="space-y-10 text-white">
      {optimalWindow && (
        <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-500/10">
          <div className="text-emerald-300 font-bold">
            OPTIMAL BREEDING WINDOW
          </div>
        </div>
      )}

      {/* HEAT */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold mb-4">
          Heat Log
        </h2>

        <form action={addHeatCycleAction}>
          <input type="hidden" name="dog_id" value={dogId} />

          <input name="start_date" type="date" required />
          <input name="progesterone" type="number" step="0.1" required />
          <textarea name="notes" />

          <button type="submit">Save Heat</button>
        </form>

        <div className="mt-4">
          {heats.map((h) => (
            <div key={h.id}>
              {h.start_date} — {h.progesterone}
            </div>
          ))}
        </div>
      </div>

      {/* MATING */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold mb-4">
          Mating Log
        </h2>

        <form action={addMatingAction}>
          <input type="hidden" name="female_id" value={dogId} />

          <input name="date" type="date" required />
          <input name="male_name" type="text" required />
          <textarea name="notes" />

          <button type="submit">Save Mating</button>
        </form>

        <div className="mt-4">
          {matings.map((m) => (
            <div key={m.id}>
              {m.date} — {m.male_name}
            </div>
          ))}
        </div>
      </div>

      {/* LITTER */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold mb-4">
          Whelping / Litter
        </h2>

        <form action={addLitterAction}>
          <input type="hidden" name="female_id" value={dogId} />

          <input name="birth_date" type="date" required />
          <input name="live_puppies" type="number" required />
          <input name="dead_puppies" type="number" />

          <button type="submit">Save Litter</button>
        </form>
      </div>
    </div>
  );
}

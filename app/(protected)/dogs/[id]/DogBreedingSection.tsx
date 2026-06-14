"use client";

import { useMemo, useState } from "react";
import {
  addHeatCycleAction,
  addMatingAction,
  addWhelpingAction,
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
  matings: Mating[];
};

export default function DogBreedingSection({
  dogId,
  heatCycles,
  matings,
}: Props) {
  const heats = heatCycles;

  const latest = useMemo(() => {
    if (!heats.length) return null;
    return [...heats].sort(
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
        <div className="p-4 border border-emerald-500 bg-emerald-500/10">
          OPTIMAL BREEDING WINDOW
        </div>
      )}

      {/* HEAT */}
      <div>
        <h2>Heat Cycle</h2>

        <form action={addHeatCycleAction} className="grid gap-2">
          <input type="hidden" name="dog_id" value={dogId} />

          <input name="start_date" type="date" required />
          <input name="progesterone" type="number" step="0.1" required />
          <textarea name="notes" />

          <button type="submit">Save Heat</button>
        </form>

        {heats.map((h) => (
          <div key={h.id}>
            {h.start_date} — {h.progesterone}
          </div>
        ))}
      </div>

      {/* MATING */}
      <div>
        <h2>Matings</h2>

        <form action={addMatingAction} className="grid gap-2">
          <input type="hidden" name="female_id" value={dogId} />

          <input name="date" type="date" required />
          <input name="male_name" type="text" required />
          <textarea name="notes" />

          <button type="submit">Save Mating</button>
        </form>

        {matings.map((m) => (
          <div key={m.id}>
            {m.date} — {m.male_name}
          </div>
        ))}
      </div>

      {/* WHELPING */}
      <div>
        <h2>Whelping</h2>

        <form action={addWhelpingAction} className="grid gap-2">
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

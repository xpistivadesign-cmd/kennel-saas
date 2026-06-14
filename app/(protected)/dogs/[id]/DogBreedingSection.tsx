"use client";

import { useMemo, useState } from "react";
import {
  addHeatAction,
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
  initialHeats: Heat[];
  initialMatings?: Mating[];
};

export default function DogBreedingSection({
  dogId,
  initialHeats,
  initialMatings = [],
}: Props) {
  const [heats] = useState<Heat[]>(initialHeats);
  const [matings] = useState<Mating[]>(initialMatings);

  const latestProg = useMemo(() => {
    if (!heats || heats.length === 0) return null;
    return heats
      .slice()
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() -
          new Date(a.start_date).getTime()
      )[0];
  }, [heats]);

  const optimalWindow =
    latestProg &&
    latestProg.progesterone >= 5 &&
    latestProg.progesterone <= 10;

  return (
    <div className="space-y-10 text-white">
      {/* HEADER STATUS */}
      {optimalWindow && (
        <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-500/10 animate-pulse">
          <div className="text-emerald-300 font-bold text-lg">
            OPTIMAL BREEDING WINDOW - OVULATION DETECTED
          </div>
        </div>
      )}

      {/* HEAT FORM */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold text-lg mb-4">
          Heat & Progesterone Log
        </h2>

        <form
          action={addHeatAction.bind(null, dogId)}
          className="grid gap-3"
        >
          <input
            name="start_date"
            type="date"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <input
            name="progesterone"
            type="number"
            step="0.1"
            placeholder="Progesterone ng/ml"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="bg-zinc-800 p-2 rounded"
          />

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold p-2 rounded"
          >
            Save Heat
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {heats.map((h) => (
            <div
              key={h.id}
              className="p-3 rounded bg-zinc-800 border border-zinc-700"
            >
              <div className="text-sm text-zinc-300">
                {h.start_date}
              </div>
              <div className="text-white font-semibold">
                {h.progesterone} ng/ml
              </div>
              <div className="text-zinc-400 text-sm">
                {h.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MATING FORM */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold text-lg mb-4">
          Mating Log
        </h2>

        <form
          action={addMatingAction.bind(null, dogId)}
          className="grid gap-3"
        >
          <input
            name="date"
            type="date"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <input
            name="male_name"
            type="text"
            placeholder="Stud / Male name"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="bg-zinc-800 p-2 rounded"
          />

          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold p-2 rounded"
          >
            Save Mating
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {matings.map((m) => {
            const due = new Date(m.date);
            due.setDate(due.getDate() + 63);

            return (
              <div
                key={m.id}
                className="p-3 rounded bg-zinc-800 border border-zinc-700"
              >
                <div className="text-sm text-zinc-300">
                  Mating: {m.date}
                </div>
                <div className="text-white font-semibold">
                  {m.male_name}
                </div>
                <div className="text-amber-400 text-sm">
                  Expected Whelping:{" "}
                  {due.toISOString().split("T")[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHELPING FORM */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-amber-400 font-semibold text-lg mb-4">
          Whelping / Litter Registration
        </h2>

        <form
          action={addWhelpingAction.bind(null, dogId)}
          className="grid gap-3"
        >
          <input
            name="birth_date"
            type="date"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <input
            name="live_puppies"
            type="number"
            placeholder="Live puppies"
            className="bg-zinc-800 p-2 rounded"
            required
          />

          <input
            name="dead_puppies"
            type="number"
            placeholder="Stillborn puppies"
            className="bg-zinc-800 p-2 rounded"
          />

          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold p-2 rounded"
          >
            Register Litter
          </button>
        </form>
      </div>
    </div>
  );
}

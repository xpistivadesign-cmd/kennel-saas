```tsx
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
  progesterone: number | null;
  notes: string | null;
};

type Props = {
  dogId: string;
  heats: Heat[];
};

export default function DogBreedingSection({
  dogId,
  heats,
}: Props) {
  const [
    matingDate,
    setMatingDate,
  ] = useState("");

  const latest =
    heats.length > 0
      ? heats[0]
      : null;

  const optimal =
    latest?.progesterone !== null &&
    latest?.progesterone !== undefined &&
    latest.progesterone >= 5 &&
    latest.progesterone <= 10;

  const dueDate =
    useMemo(() => {
      if (!matingDate) {
        return "";
      }

      const d =
        new Date(matingDate);

      d.setDate(
        d.getDate() + 63
      );

      return d
        .toISOString()
        .slice(0, 10);
    }, [matingDate]);

  return (
    <div className="space-y-8">

      {optimal && (
        <div className="animate-pulse rounded-3xl border border-green-500 bg-green-500/10 p-6 text-center text-2xl font-bold text-green-300">
          🔥 OPTIMAL BREEDING WINDOW
        </div>
      )}

      <section className="rounded-3xl bg-zinc-900 p-6">

        <h2 className="mb-5 text-xl font-bold text-amber-300">
          Heat & Progesterone
        </h2>

        <form
          action={addHeatAction}
          className="grid gap-4"
        >
          <input
            type="hidden"
            name="dogId"
            value={dogId}
          />

          <input
            required
            name="startDate"
            type="date"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <input
            required
            step="0.1"
            type="number"
            name="progesterone"
            placeholder="Ng/ml"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <button
            className="rounded-xl bg-amber-500 py-3 font-bold text-black"
          >
            Save Heat
          </button>
        </form>

        <div className="mt-6 space-y-3">

          {heats.map(
            (
              item
            ) => (
              <div
                key={item.id}
                className="rounded-xl bg-zinc-800 p-4"
              >
                <div>
                  {item.start_date}
                </div>

                <div>
                  Progesterone:
                  {" "}
                  {item.progesterone}
                </div>

                <div>
                  {item.notes}
                </div>
              </div>
            )
          )}

        </div>

      </section>

      <section className="rounded-3xl bg-zinc-900 p-6">

        <h2 className="mb-5 text-xl font-bold text-amber-300">
          Mating Log
        </h2>

        <form
          action={addMatingAction}
          className="grid gap-4"
        >

          <input
            hidden
            name="femaleId"
            value={dogId}
          />

          <input
            required
            type="date"
            name="matingDate"
            onChange={(e) =>
              setMatingDate(
                e.target.value
              )
            }
            className="rounded-xl bg-zinc-800 p-3"
          />

          <input
            required
            name="maleName"
            placeholder="Stud name"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <textarea
            name="notes"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <button
            className="rounded-xl bg-amber-500 py-3 text-black"
          >
            Save Mating
          </button>

        </form>

        {dueDate && (
          <div className="mt-6 rounded-xl bg-blue-500/10 p-5 text-blue-300">
            Expected whelping:
            {" "}
            {dueDate}
          </div>
        )}

      </section>

      <section className="rounded-3xl bg-zinc-900 p-6">

        <h2 className="mb-5 text-xl font-bold text-amber-300">
          Register Litter
        </h2>

        <form
          action={addWhelpingAction}
          className="grid gap-4"
        >

          <input
            hidden
            name="damId"
            value={dogId}
          />

          <input
            required
            type="date"
            name="birthDate"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <input
            required
            name="litterName"
            placeholder="Litter"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <input
            required
            type="number"
            name="livePuppies"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <input
            required
            type="number"
            name="deadPuppies"
            className="rounded-xl bg-zinc-800 p-3"
          />

          <button
            className="rounded-xl bg-amber-500 py-3 text-black"
          >
            Register Litter
          </button>

        </form>

      </section>

    </div>
  );
}
```

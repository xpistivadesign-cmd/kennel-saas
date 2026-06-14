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
  progesterone?: number | null;
  notes?: string | null;
};

type Props = {
  dogId: string;
  initialHeats: Heat[];
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
}

function addDays(date: string, days: number) {
  const d = new Date(date);

  d.setDate(d.getDate() + days);

  return d.toLocaleDateString();
}

export default function DogBreedingSection({
  dogId,
  initialHeats,
}: Props) {
  const [matingDate, setMatingDate] =
    useState("");

  const latestHeat =
    initialHeats?.[0];

  const showWindow =
    typeof latestHeat?.progesterone ===
      "number" &&
    latestHeat.progesterone >= 5 &&
    latestHeat.progesterone <= 10;

  const dueDate =
    useMemo(() => {
      if (!matingDate) {
        return null;
      }

      return addDays(
        matingDate,
        63
      );
    }, [matingDate]);

  return (
    <div className="space-y-8">

      {showWindow && (
        <div className="animate-pulse rounded-3xl border border-green-500 bg-green-500/10 p-6">

          <div className="text-center text-2xl font-black text-green-400">

            🔥 OPTIMAL BREEDING WINDOW

          </div>

          <div className="mt-2 text-center text-green-300">

            OVULATION DETECTED

          </div>

        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h2 className="mb-6 text-xl font-bold text-amber-400">

            Heat & Progesterone

          </h2>

          <form
            action={addHeatAction.bind(
              null,
              dogId
            )}
            className="grid gap-4"
          >

            <input
              type="date"
              name="start_date"
              required
              className="rounded-xl bg-zinc-900 p-3"
            />

            <input
              type="number"
              step="0.1"
              name="progesterone"
              required
              placeholder="Progesterone ng/ml"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <textarea
              name="notes"
              placeholder="Notes"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <button
              className="rounded-xl bg-amber-500 p-3 font-bold text-black"
            >
              Save Heat
            </button>

          </form>

          <div className="mt-6 space-y-3">

            {initialHeats?.length >
            0 ? (
              initialHeats.map(
                (
                  heat
                ) => (
                  <div
                    key={
                      heat.id
                    }
                    className="rounded-xl bg-zinc-900 p-4"
                  >

                    <div>

                      {
                        formatDate(
                          heat.start_date
                        )
                      }

                    </div>

                    <div className="text-amber-400">

                      {
                        heat.progesterone ??
                        "-"
                      }{" "}
                      ng/ml

                    </div>

                    <div className="text-sm text-zinc-500">

                      {
                        heat.notes
                      }

                    </div>

                  </div>
                )
              )
            ) : (
              <div className="text-zinc-500">

                No heats recorded

              </div>
            )}

          </div>

        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h2 className="mb-6 text-xl font-bold text-amber-400">

            Mating Planner

          </h2>

          <form
            action={addMatingAction.bind(
              null,
              dogId
            )}
            className="grid gap-4"
          >

            <input
              type="date"
              name="mating_date"
              required
              value={
                matingDate
              }
              onChange={(
                e
              ) =>
                setMatingDate(
                  e.target
                    .value
                )
              }
              className="rounded-xl bg-zinc-900 p-3"
            />

            <input
              name="male_name"
              required
              placeholder="Stud name"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <textarea
              name="notes"
              placeholder="Notes"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <button
              className="rounded-xl bg-blue-500 p-3 font-bold"
            >
              Save Mating
            </button>

          </form>

          {dueDate && (
            <div className="mt-6 rounded-xl bg-blue-500/10 p-4">

              <div className="text-sm text-blue-300">

                Estimated Whelping Date

              </div>

              <div className="text-xl font-bold text-blue-200">

                {dueDate}

              </div>

            </div>
          )}

        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h2 className="mb-6 text-xl font-bold text-amber-400">

            Register Litter

          </h2>

          <form
            action={addWhelpingAction.bind(
              null,
              dogId
            )}
            className="grid gap-4"
          >

            <input
              type="date"
              name="birth_date"
              required
              className="rounded-xl bg-zinc-900 p-3"
            />

            <input
              name="litter_name"
              required
              placeholder="Litter letter"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <input
              type="number"
              name="live_puppies"
              required
              placeholder="Live puppies"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <input
              type="number"
              name="dead_puppies"
              required
              placeholder="Stillborn"
              className="rounded-xl bg-zinc-900 p-3"
            />

            <button
              className="rounded-xl bg-green-500 p-3 font-bold text-black"
            >
              Register Litter
            </button>

          </form>

        </section>

      </div>

    </div>
  );
}

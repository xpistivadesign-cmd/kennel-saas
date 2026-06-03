"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { differenceInDays } from "date-fns";

type Dog = any;
type Mating = any;

export default function BreedingCalendar() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [matings, setMatings] = useState<Mating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [{ data: dogsData }, { data: matingData }] =
      await Promise.all([
        supabase.from("dogs").select("*").eq("sex", "female"),
        supabase.from("matings").select("*"),
      ]);

    setDogs(dogsData || []);
    setMatings(matingData || []);
    setLoading(false);
  }

  const enriched = useMemo(() => {
    return dogs.map((dog) => {
      const related = matings
        .filter((m) => m.female_id === dog.id)
        .sort(
          (a, b) =>
            new Date(b.mating_date).getTime() -
            new Date(a.mating_date).getTime()
        );

      const last = related[0];

      const daysLeft = last?.estimated_due_date
        ? differenceInDays(
            new Date(last.estimated_due_date),
            new Date()
          )
        : null;

      const progress =
        last?.estimated_due_date && last?.mating_date
          ? Math.min(
              100,
              Math.max(
                0,
                (63 -
                  Math.max(
                    0,
                    differenceInDays(
                      new Date(last.estimated_due_date),
                      new Date()
                    )
                  )) /
                  63 *
                  100
              )
            )
          : 0;

      return {
        ...dog,
        lastMating: last,
        daysLeft,
        progress,
      };
    });
  }, [dogs, matings]);

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading breeding calendar...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          📅 Breeding Calendar
        </h1>
        <p className="text-gray-500">
          Lifecycle timeline for all females
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-4">
        {enriched.map((dog) => (
          <div
            key={dog.id}
            className="border rounded-xl p-5 space-y-3 hover:shadow-lg transition"
          >

            {/* TOP */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-lg">
                  {dog.name}
                </div>
                <div className="text-sm text-gray-500">
                  {dog.breed}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">
                  Last mating
                </div>
                <div className="font-semibold">
                  {dog.lastMating?.mating_date || "—"}
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600"
                style={{ width: `${dog.progress}%` }}
              />
            </div>

            {/* BOTTOM METRICS */}
            <div className="flex justify-between text-sm">
              <div>
                ⏳{" "}
                {dog.daysLeft !== null
                  ? `${dog.daysLeft} days left`
                  : "No pregnancy"}
              </div>

              <div>
                ❤️{" "}
                {dog.lastMating ? "Pregnant cycle" : "Idle"}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 pt-2">
              <button className="px-3 py-1 border rounded text-sm">
                + Heat
              </button>

              <button className="px-3 py-1 border rounded text-sm">
                + Mating
              </button>

              <button className="px-3 py-1 bg-black text-white rounded text-sm">
                Open Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
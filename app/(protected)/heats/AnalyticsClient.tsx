"use client";

import { useState } from "react";

type Test = {
  id: string;
  test_date: string;
  value: number;
};

type Heat = {
  id: string;
  start_date: string;
  end_date: string | null;
  dog_id: string;
  progesterone_tests?: Test[];
};

export default function AnalyticsClient({ heats }: { heats: Heat[] }) {
  const [unit, setUnit] = useState<"ngml" | "nmol">("ngml");

  const factor = 3.18;

  const format = (v: number) =>
    unit === "nmol"
      ? `${(v * factor).toFixed(2)} nmol/L`
      : `${v.toFixed(1)} ng/ml`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Analitika</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setUnit("ngml")}
            className="px-2 py-1 border rounded"
          >
            ng/ml
          </button>
          <button
            onClick={() => setUnit("nmol")}
            className="px-2 py-1 border rounded"
          >
            nmol/L
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {heats.map((h) => {
          const tests = h.progesterone_tests || [];

          const values = tests.map((t) => t.value);
          const peak = values.length ? Math.max(...values) : 0;
          const last = values.length ? values[values.length - 1] : 0;

          return (
            <div key={h.id} className="border rounded-xl p-4">
              <div className="text-xs text-gray-400">
                {h.dog_id.slice(0, 8)}
              </div>

              <div className="mt-2">
                Peak: <b>{format(peak)}</b>
              </div>

              <div>
                Last: <b>{format(last)}</b>
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Mérések: {tests.length}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
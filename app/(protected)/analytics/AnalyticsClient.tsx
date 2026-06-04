"use client";

import { useMemo, useState } from "react";
import {
  getPeak,
  getLast,
  getOptimalWindow,
  ProgTest
} from "@/lib/breeding-ai";

type Heat = {
  id: string;
  dog_id: string;
  start_date: string;
  progesterone_tests?: ProgTest[];
};

type Unit = "ngml" | "nmol";

const CONV = 3.18;

export default function AnalyticsClient({ heats }: { heats: Heat[] }) {
  const [unit, setUnit] = useState<Unit>("ngml");

  const format = (v: number) =>
    unit === "nmol"
      ? `${(v * CONV).toFixed(2)} nmol/L`
      : `${v.toFixed(1)} ng/ml`;

  const data = useMemo(() => {
    return (heats || []).map(h => {
      const tests = h.progesterone_tests || [];

      return {
        ...h,
        tests,
        peak: getPeak(tests),
        last: getLast(tests),
        optimal: getOptimalWindow(tests),
      };
    });
  }, [heats]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border rounded-xl p-4">
        <h1 className="font-bold text-lg">🧬 Breeding Intelligence</h1>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setUnit("ngml")} className="px-2 text-xs bg-white rounded">
            ng/ml
          </button>
          <button onClick={() => setUnit("nmol")} className="px-2 text-xs">
            nmol/L
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-4">

        {data.map(h => (
          <div key={h.id} className="bg-white border rounded-xl p-5 space-y-3">

            <div className="text-xs text-gray-500 flex justify-between">
              <span>{h.dog_id.slice(0, 8)}</span>
              <span>{h.optimal.status}</span>
            </div>

            <div className="text-sm space-y-1">
              <p>🔥 Peak: <b>{format(h.peak)}</b></p>
              <p>📊 Last: <b>{format(h.last)}</b></p>
            </div>

            <div className="text-xs p-2 rounded bg-gray-50">
              {h.optimal.message}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
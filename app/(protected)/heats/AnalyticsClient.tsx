"use client";

import { useState } from "react";
import { format, getPeak, getLast, getTrend, getDueDate } from "@/lib/fertility";
import type { Unit } from "@/lib/progesterone";

type Heat = {
  id: string;
  start_date: string;
  end_date: string | null;
  dog_id: string;
  progesterone_tests?: {
    test_date: string;
    value: number;
  }[];
};

export default function AnalyticsClient({ heats }: { heats: Heat[] }) {
  const [unit, setUnit] = useState<Unit>("ngml");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border p-4 rounded-xl">
        <div>
          <h1 className="text-xl font-bold">🧬 Fertility Analytics</h1>
          <p className="text-xs text-gray-500">
            Progesterone intelligence system
          </p>
        </div>

        {/* UNIT SWITCH */}
        <div className="flex gap-2">
          <button
            onClick={() => setUnit("ngml")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "ngml" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            ng/ml
          </button>

          <button
            onClick={() => setUnit("nmoll")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "nmoll" ? "bg-black text-white" : "bg-gray-100"
            }`}
          >
            nmol/L
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heats.map((heat) => {
          const tests = heat.progesterone_tests ?? [];

          const peak = getPeak(tests);
          const last = getLast(tests);
          const trend = getTrend(tests);
          const due = getDueDate(heat.start_date);

          return (
            <div key={heat.id} className="bg-white border rounded-xl p-5 space-y-3">

              <div className="text-xs text-gray-400">
                🐶 {heat.dog_id?.slice?.(0, 8) ?? "—"}
              </div>

              {/* KPI */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  Peak: <b>{peak.toFixed(1)}</b>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  Last: <b>{last.toFixed(1)}</b>
                </div>
              </div>

              {/* TREND */}
              <div className="text-xs">
                Trend: <b>{trend.label}</b>
              </div>

              {/* OVULATION WINDOW */}
              <div className="text-xs bg-green-50 p-2 rounded">
                🐣 Due: {due.toLocaleDateString("hu-HU")}
              </div>

              {/* COUNT */}
              <div className="text-xs text-gray-400">
                Tests: {tests.length}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
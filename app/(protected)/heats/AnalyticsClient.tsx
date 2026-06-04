"use client";

import React, { useState } from "react";

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

type Unit = "ngml" | "nmolL";

const CONVERSION = 3.18;

// 🔧 SAFE FORMAT (NINCS external lib)
function formatValue(value: number, unit: Unit) {
  const v = unit === "nmolL" ? value * CONVERSION : value;

  return unit === "nmolL"
    ? `${v.toFixed(2)} nmol/L`
    : `${v.toFixed(1)} ng/ml`;
}

// 📊 BASIC ANALYTICS (dependency-free)
function getPeak(values: number[]) {
  return values.length ? Math.max(...values) : 0;
}

function getLast(values: number[]) {
  return values.length ? values[values.length - 1] : 0;
}

function getTrend(values: number[]) {
  if (values.length < 2) return "unknown";

  const diff = values[values.length - 1] - values[values.length - 2];

  if (diff > 1.5) return "up_fast";
  if (diff > 0) return "up";
  if (diff < 0) return "down";
  return "flat";
}

export default function AnalyticsClient({ heats }: { heats: Heat[] }) {
  const [unit, setUnit] = useState<Unit>("ngml");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white border rounded-xl p-4">
        <div>
          <h1 className="text-xl font-bold">📊 Progeszteron Analitika</h1>
          <p className="text-xs text-gray-500">
            Dependency-free SaaS analytics dashboard
          </p>
        </div>

        {/* UNIT SWITCH */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setUnit("ngml")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "ngml" ? "bg-white shadow" : ""
            }`}
          >
            ng/ml
          </button>

          <button
            onClick={() => setUnit("nmolL")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "nmolL" ? "bg-white shadow" : ""
            }`}
          >
            nmol/L
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(heats || []).map((heat) => {
          const tests = heat.progesterone_tests || [];

          const values = tests.map((t) => Number(t.value));

          const peak = getPeak(values);
          const last = getLast(values);
          const trend = getTrend(values);

          const trendLabel =
            trend === "up_fast"
              ? "⚡ gyors emelkedés"
              : trend === "up"
              ? "↗ emelkedő"
              : trend === "down"
              ? "↘ csökkenő"
              : trend === "flat"
              ? "➖ stabil"
              : "❔ nincs adat";

          return (
            <div
              key={heat.id}
              className="bg-white border rounded-xl p-5 space-y-3"
            >

              {/* TOP BAR */}
              <div className="flex justify-between text-xs text-gray-500">
                <span>{heat.dog_id.slice(0, 8)}...</span>
                <span>{heat.end_date ? "lezárult" : "aktív"}</span>
              </div>

              {/* VALUES */}
              <div className="space-y-1">
                <p className="text-sm">
                  🔥 Peak:{" "}
                  <strong>{formatValue(peak, unit)}</strong>
                </p>

                <p className="text-sm">
                  📍 Last:{" "}
                  <strong>{formatValue(last, unit)}</strong>
                </p>
              </div>

              {/* TREND */}
              <div className="text-xs font-medium">
                {trendLabel}
              </div>

              {/* META */}
              <div className="text-xs text-gray-400">
                Mérések: {tests.length}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
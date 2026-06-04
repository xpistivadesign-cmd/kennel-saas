"use client";

import React, { useMemo, useState } from "react";

interface ProgesteroneTest {
  id: string;
  test_date: string;
  value: number; // mindig NG/ML az adatbázisban
}

interface HeatRecord {
  id: string;
  start_date: string;
  end_date: string | null;
  dog_id: string;
  progesterone_tests?: ProgesteroneTest[];
}

export default function AnalyticsClient({ heats }: { heats: HeatRecord[] }) {
  const [unit, setUnit] = useState<"ngml" | "nmol">("ngml");

  const CONV = 3.18;

  const format = (v: number) => {
    if (unit === "nmol") return `${(v * CONV).toFixed(2)} nmol/L`;
    return `${v.toFixed(1)} ng/ml`;
  };

  const processed = useMemo(() => {
    return (heats || []).map((h) => {
      const tests = (h.progesterone_tests || [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.test_date).getTime() -
            new Date(b.test_date).getTime()
        );

      const values = tests.map((t) => t.value);
      const peak = values.length ? Math.max(...values) : 0;
      const last = values.length ? values[values.length - 1] : 0;

      let status = "Nincs adat";
      let color = "text-gray-500";

      if (last >= 5 && last <= 8) {
        status = "OPTIMÁLIS ABLAK";
        color = "text-green-600";
      } else if (last > 8) {
        status = "Ovuláció után";
        color = "text-purple-600";
      } else if (last >= 2) {
        status = "Közelgő csúcs";
        color = "text-amber-600";
      }

      return { ...h, tests, peak, last, status, color };
    });
  }, [heats]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-xl font-bold">🧬 Analytics Dashboard</h1>
          <p className="text-xs text-gray-500">
            Progeszteron + ovulációs predikció
          </p>
        </div>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setUnit("ngml")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "ngml" ? "bg-white shadow" : ""
            }`}
          >
            ng/ml
          </button>
          <button
            onClick={() => setUnit("nmol")}
            className={`px-3 py-1 text-xs rounded ${
              unit === "nmol" ? "bg-white shadow" : ""
            }`}
          >
            nmol/L
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-4">
        {processed.map((h) => (
          <div
            key={h.id}
            className="bg-white border rounded-xl p-5 space-y-3"
          >
            <div className="flex justify-between text-xs text-gray-500">
              <span>{h.dog_id.slice(0, 8)}</span>
              <span>{h.status}</span>
            </div>

            <div className="text-sm space-y-1">
              <p>
                🔥 Peak: <b>{format(h.peak)}</b>
              </p>
              <p>
                📊 Last: <b>{format(h.last)}</b>
              </p>
              <p className="text-xs text-gray-400">
                Tests: {h.tests.length}
              </p>
            </div>

            <div className={`text-xs font-bold ${h.color}`}>
              {h.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"use client";

import React from "react";

interface HeatRecord {
  id: string;
  start_date: string;
  end_date: string | null;
  dog_id: string;
  progesterone_tests?: {
    id: string;
    test_date: string;
    value: number;
  }[];
}

export default function AnalyticsClient({
  heats,
}: {
  heats: HeatRecord[];
}) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        📈 Progeszteron Analytics Dashboard
      </h1>

      {!heats?.length ? (
        <p className="text-gray-500">Nincs adat</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {heats.map((heat) => {
            const tests = heat.progesterone_tests ?? [];

            const peak =
              tests.length > 0
                ? Math.max(...tests.map((t) => Number(t.value)))
                : 0;

            const avg =
              tests.length > 0
                ? tests.reduce((a, b) => a + Number(b.value), 0) /
                  tests.length
                : 0;

            return (
              <div
                key={heat.id}
                className="bg-white border rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Dog: {heat.dog_id.slice(0, 8)}...</span>
                  <span>
                    {heat.end_date ? "Lezárult" : "Aktív"}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    📅 Kezdés:{" "}
                    {new Date(heat.start_date).toLocaleDateString(
                      "hu-HU"
                    )}
                  </p>

                  <p>
                    🔥 Peak:{" "}
                    <span className="font-bold text-pink-600">
                      {peak > 0 ? `${peak} ng/ml` : "Nincs adat"}
                    </span>
                  </p>

                  <p>
                    📊 Átlag:{" "}
                    <span className="font-medium">
                      {avg > 0 ? avg.toFixed(2) + " ng/ml" : "-"}
                    </span>
                  </p>

                  <p className="text-xs text-gray-400">
                    Mérési pontok: {tests.length}
                  </p>
                </div>

                {/* Simple visual indicator (NO LIBRARY) */}
                <div className="h-2 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-pink-400"
                    style={{
                      width: `${Math.min((peak / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import { useMemo } from "react";

type Heat = {
  id: string;
  dog_id: string;
  start_date: string;
  end_date: string | null;
  progesterone_tests: {
    id: string;
    test_date: string;
    value: number;
  }[];
};

type Props = {
  heats: Heat[];
};

export default function AnalyticsClient({ heats }: Props) {
  // 📊 flatten all tests
  const allTests = useMemo(() => {
    return heats.flatMap((h) => h.progesterone_tests ?? []);
  }, [heats]);

  // 📈 stats
  const stats = useMemo(() => {
    if (!allTests.length) {
      return {
        avg: 0,
        max: 0,
        last: null as number | null,
      };
    }

    const values = allTests.map((t) => t.value);

    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      last: values[values.length - 1],
    };
  }, [allTests]);

  // 🎯 ovulation window detection
  const optimalTests = allTests.filter(
    (t) => t.value >= 5 && t.value <= 8
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        🧬 Breeding Analytics Dashboard
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow">
          <p className="text-xs text-gray-400 uppercase">Átlag szint</p>
          <p className="text-2xl font-bold">
            {stats.avg.toFixed(2)} ng/ml
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow">
          <p className="text-xs text-gray-400 uppercase">Peak érték</p>
          <p className="text-2xl font-bold text-pink-600">
            {stats.max.toFixed(2)} ng/ml
          </p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow">
          <p className="text-xs text-gray-400 uppercase">Utolsó mérés</p>
          <p className="text-2xl font-bold">
            {stats.last ? `${stats.last} ng/ml` : "—"}
          </p>
        </div>
      </div>

      {/* OPTIMAL WINDOW */}
      <div className="bg-white border rounded-lg p-5 shadow">
        <h2 className="font-bold text-sm uppercase text-gray-500 mb-3">
          🎯 Optimális fedeztetési ablak (5–8 ng/ml)
        </h2>

        {optimalTests.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Jelenleg nincs optimális ciklus adat.
          </p>
        ) : (
          <div className="space-y-2">
            {optimalTests.map((t) => (
              <div
                key={t.id}
                className="flex justify-between text-sm border-b pb-1"
              >
                <span className="text-gray-600">
                  {new Date(t.test_date).toLocaleDateString("hu-HU")}
                </span>
                <span className="font-bold text-green-600">
                  {t.value} ng/ml ✔
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HEAT OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heats.map((heat) => {
          const tests = heat.progesterone_tests ?? [];

          const peak = tests.length
            ? Math.max(...tests.map((t) => t.value))
            : 0;

          return (
            <div
              key={heat.id}
              className="bg-white border rounded-lg p-5 shadow"
            >
              <div className="flex justify-between mb-2">
                <span className="text-xs text-gray-400">
                  Kutya: {heat.dog_id}
                </span>

                <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                  {heat.end_date ? "Lezárult" : "Aktív"}
                </span>
              </div>

              <p className="text-sm text-gray-700">
                📅{" "}
                {new Date(heat.start_date).toLocaleDateString("hu-HU")}
              </p>

              <p className="text-sm mt-1">
                🔥 Peak:{" "}
                <span className="font-bold text-pink-600">
                  {peak} ng/ml
                </span>
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Mérési pontok: {tests.length}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { calculateGeneticScore } from "@/lib/genetics";

export default function DogProfileClient({
  dog,
  health,
  payments = [],
}: any) {
  // FIX: most már partner nélkül számolunk (safe default)
  const genetic = calculateGeneticScore(dog);

  const totalEarned = payments.reduce(
    (sum: number, p: any) => sum + (p.paid_amount || 0),
    0
  );

  return (
    <div className="p-4">
      {/* GENETICS PANEL */}
      <div className="mb-4 p-3 rounded-lg border bg-white">
        <div className="text-sm font-semibold text-gray-800">
          🧬 Genetikai Kockázati Panel
        </div>

        <div className="mt-2">
          <span className="text-sm font-medium">
            {genetic.label}
          </span>
        </div>

        <div className="mt-1">
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
            COI: {genetic.coi.toFixed(2)}%
          </span>

          <span className="ml-2 text-xs">
            Kockázat: {genetic.risk}
          </span>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="text-sm">
        <div>Név: {dog?.name}</div>
        <div>Bevétel: ${totalEarned}</div>
      </div>
    </div>
  );
}

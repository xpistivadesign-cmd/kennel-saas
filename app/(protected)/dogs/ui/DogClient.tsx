"use client";

import { calculateGeneticScore } from "@/lib/genetics";

export default function DogClient({
  dog,
  health,
  payments = [],
}: any) {
  // 🧬 COI számítás (partner nélkül safe mód)
  const genetic = calculateGeneticScore(dog);

  const totalEarned = payments.reduce(
    (sum: number, p: any) => sum + (p.paid_amount || 0),
    0
  );

  return (
    <div className="p-4 space-y-4">
      {/* 🧬 GENETIC PANEL */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="text-sm font-bold text-gray-800">
          🧬 Genetikai Kockázati Panel
        </div>

        <div className="mt-2 text-sm font-medium">
          {genetic.label}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            COI: {genetic.coi.toFixed(2)}%
          </span>

          <span className="text-xs text-gray-600">
            Kockázat: {genetic.risk}
          </span>
        </div>
      </div>

      {/* DOG INFO */}
      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium">Név:</span> {dog?.name}
        </div>

        <div>
          <span className="font-medium">Bevétel:</span> ${totalEarned}
        </div>

        <div>
          <span className="font-medium">Státusz:</span> {health?.status ?? "OK"}
        </div>
      </div>
    </div>
  );
}

"use client";

import { calculateGeneticScore } from "@/lib/genetics";
import { calculateDebtStatus } from "@/lib/debt-ai";

export default function DogProfileClient({
  dog,
  heats,
  payments,
  health,
}: any) {
  const genetic = calculateGeneticScore(dog);

  const totalEarned = payments.reduce(
    (sum: number, p: any) => sum + (p.paid_amount || 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white border rounded-2xl p-5">
        <h1 className="text-2xl font-bold">{dog.name}</h1>
        <p className="text-sm text-gray-500">
          {dog.breed} • {dog.microchip}
        </p>

        <div className="mt-3">
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
            Genetics: {genetic.label} ({genetic.score})
          </span>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded-xl">
          <p className="text-xs text-gray-400">Összes bevétel</p>
          <p className="text-xl font-bold">{totalEarned} HUF</p>
        </div>

        <div className="p-4 bg-white border rounded-xl">
          <p className="text-xs text-gray-400">Tüzelések</p>
          <p className="text-xl font-bold">{heats.length}</p>
        </div>

        <div className="p-4 bg-white border rounded-xl">
          <p className="text-xs text-gray-400">Egészség tesztek</p>
          <p className="text-xl font-bold">{health.length}</p>
        </div>
      </div>

      {/* HEATS */}
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-bold mb-3">🩸 Tüzelési előzmények</h2>

        {heats.map((h: any) => (
          <div key={h.id} className="border-b py-2 text-sm">
            {h.start_date} → {h.end_date || "aktív"}
          </div>
        ))}
      </div>

      {/* PAYMENTS */}
      <div className="bg-white border rounded-2xl p-5">
        <h2 className="font-bold mb-3">💳 Pénzügyek</h2>

        {payments.map((p: any) => {
          const status = calculateDebtStatus(p);

          return (
            <div
              key={p.id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{p.amount} HUF</span>
              <span className="text-xs">{status.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
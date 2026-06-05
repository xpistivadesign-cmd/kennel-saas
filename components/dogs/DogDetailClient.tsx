"use client";

import { calculateGeneticScore } from "@/lib/genetics";

export default function DogDetailClient({ dog }: any) {
  const genetic = calculateGeneticScore(dog);

  return (
    <div className="p-4 space-y-4">
      {/* 🧬 GENETICS PANEL */}
      <div className="p-4 border rounded bg-white">
        <div className="font-bold text-sm">
          🧬 Genetikai Kockázati Panel
        </div>

        <div className="mt-2 text-sm">
          {genetic.label}
        </div>

        <div className="mt-2 flex gap-2">
          <span className="text-xs bg-purple-100 px-2 py-1 rounded">
            COI: {genetic.coi.toFixed(2)}%
          </span>

          <span className="text-xs">
            {genetic.risk}
          </span>
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="text-sm">
        <div>Név: {dog?.name}</div>
        <div>ID: {dog?.id}</div>
      </div>
    </div>
  );
}

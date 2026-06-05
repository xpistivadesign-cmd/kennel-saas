"use client";

import { calculateGeneticScore } from "@/lib/genetics";
import { calculateDebtStatus } from "@/lib/debt-ai";

export default function DogProfileClient({
  dog,
  payments,
  health,
}: any) {
  const genetic = calculateGeneticScore({
    sire: dog?.sire ?? null,
    dam: dog?.dam ?? null,
  });

  const totalEarned = payments.reduce(
    (sum: number, p: any) => sum + (p.paid_amount || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* 🧬 GENETIC PANEL */}
      <div className="p-4 rounded-lg border bg-white shadow-sm">
        <h2 className="text-lg font-semibold">🧬 Genetikai kockázati panel</h2>

        <div className="mt-2 text-sm">
          <div>
            COI: <b>{genetic.coi}%</b>
          </div>

          <div>
            Státusz:{" "}
            <b
              style={{
                color:
                  genetic.risk === "HIGH"
                    ? "red"
                    : genetic.risk === "MEDIUM"
                    ? "orange"
                    : "green",
              }}
            >
              {genetic.label}
            </b>
          </div>
        </div>
      </div>

      {/* 💰 existing logic */}
      <div>
        <p>Total earned: {totalEarned}</p>
      </div>
    </div>
  );
}

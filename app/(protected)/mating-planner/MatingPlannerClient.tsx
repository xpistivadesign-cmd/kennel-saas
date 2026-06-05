"use client";

import { useMemo, useState } from "react";
import { calculateCOIv2, COIResult } from "@/lib/supabase/coi.server";

type Dog = {
  id: string;
  name: string;
  sire?: any;
  dam?: any;
};

export default function MatingPlannerClient({
  dogs,
}: {
  dogs: Dog[];
}) {
  const [sireId, setSireId] = useState<string>("");
  const [damId, setDamId] = useState<string>("");

  const sire = useMemo(
    () => dogs.find((d) => d.id === sireId),
    [sireId, dogs]
  );

  const dam = useMemo(
    () => dogs.find((d) => d.id === damId),
    [damId, dogs]
  );

  let coi: COIResult | null = null;

  if (sire && dam) {
    coi = calculateCOIv2(sire as any, dam as any);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Mating Planner</h1>

      {/* SELECTORS */}
      <div className="flex gap-4">
        <select
          className="border p-2"
          onChange={(e) => setSireId(e.target.value)}
        >
          <option value="">Select sire</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          onChange={(e) => setDamId(e.target.value)}
        >
          <option value="">Select dam</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* COI PANEL */}
      {coi && (
        <div className="p-4 rounded-xl border bg-white shadow">
          <div className="text-sm text-gray-500">Genetic Risk Panel</div>

          <div className="text-2xl font-bold">
            COI: {coi.coi}%
          </div>

          <div className="text-sm mt-1">{coi.label}</div>

          <div className="mt-2 text-xs">
            Risk level:{" "}
            <span
              className={
                coi.risk === "LOW"
                  ? "text-green-600"
                  : coi.risk === "MEDIUM"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {coi.risk}
            </span>
          </div>
        </div>
      )}

      {/* DEBUG HEATMAP */}
      {coi && (
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Ancestor Heatmap</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(coi.heatmap).map(([id, count]) => (
              <div
                key={id}
                className="p-2 border rounded bg-gray-50"
              >
                {id}: {count}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

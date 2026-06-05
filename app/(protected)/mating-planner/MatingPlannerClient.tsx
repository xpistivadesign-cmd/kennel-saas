"use client";

import { useMemo, useState } from "react";
import { calculateCOIv3, COIResult } from "@/lib/supabase/coi.server";

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

  const coi = useMemo(() => {
    if (!sire || !dam) return null;
    return calculateCOIv3(sire as any, dam as any);
  }, [sire, dam]);

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
          <div className="text-sm text-gray-500">
            Genetic Risk Panel (PRO COI v3)
          </div>

          <div className="text-2xl font-bold">
            COI: {coi.coi}%
          </div>

          <div className="text-sm mt-1">{coi.label}</div>

          <div className="text-xs mt-2">
            Risk:{" "}
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

      {/* PATHWAYS DEBUG (optional but powerful) */}
      {coi && coi.pathways.length > 0 && (
        <div className="p-4 border rounded text-xs">
          <h3 className="font-semibold mb-2">
            Critical Inbreeding Pathways
          </h3>

          <div className="space-y-2">
            {coi.pathways.slice(0, 10).map((p, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded">
                <div>Ancestor: {p.ancestorId}</div>
                <div>Weight: {p.weight.toFixed(6)}</div>
                <div>
                  Sire path: {p.sirePath.join(" → ")}
                </div>
                <div>
                  Dam path: {p.damPath.join(" → ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

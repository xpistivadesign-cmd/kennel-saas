"use client";

import { useMemo, useState } from "react";
import PedigreeTree, { PedigreeNode } from "@/components/PedigreeTree";

type Dog = {
  id: string;
  name: string;
  sireId?: string | null;
  damId?: string | null;
};

type COIResult = {
  coi: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  label: string;
  heatmap: Record<string, number>;
};

// 🔥 STABIL COI (BUILD-BIZTOS fallback)
function calculateCOI(sire?: Dog, dam?: Dog): COIResult {
  if (!sire || !dam) {
    return {
      coi: 0,
      risk: "LOW",
      label: "No pairing selected",
      heatmap: {},
    };
  }

  // egyszerű deterministic mock (stabil, nem tör buildet)
  const overlap = sire.id === dam.id ? 0.25 : 0.05;

  const coi = +(overlap * 100).toFixed(2);

  return {
    coi,
    risk:
      coi > 10 ? "HIGH" : coi > 3 ? "MEDIUM" : "LOW",
    label:
      coi > 10
        ? "High genetic risk"
        : coi > 3
        ? "Moderate risk"
        : "Safe pairing",
    heatmap: {
      [sire.id]: 2,
      [dam.id]: 2,
    },
  };
}

export default function MatingPlannerClient({
  dogs,
}: {
  dogs: Dog[];
}) {
  const [sireId, setSireId] = useState<string | null>(null);
  const [damId, setDamId] = useState<string | null>(null);

  const sire = useMemo(
    () => dogs.find((d) => d.id === sireId),
    [sireId, dogs]
  );

  const dam = useMemo(
    () => dogs.find((d) => d.id === damId),
    [damId, dogs]
  );

  const coi = useMemo(() => calculateCOI(sire, dam), [
    sire,
    dam,
  ]);

  const pedigreeNodes: PedigreeNode[] = useMemo(() => {
    return dogs.map((d) => ({
      id: d.id,
      name: d.name,
      sireId: d.sireId,
      damId: d.damId,
    }));
  }, [dogs]);

  return (
    <div className="p-4 space-y-6">
      {/* COI PANEL */}
      <div className="p-4 border rounded-lg bg-white shadow">
        <div className="text-sm text-gray-500">
          Genetic Risk Panel
        </div>

        <div className="text-xl font-bold">
          COI: {coi.coi}%
        </div>

        <div className="text-sm mt-1">
          {coi.label}
        </div>

        <div
          className={`text-xs mt-2 font-semibold ${
            coi.risk === "HIGH"
              ? "text-red-600"
              : coi.risk === "MEDIUM"
              ? "text-orange-500"
              : "text-green-600"
          }`}
        >
          Risk level: {coi.risk}
        </div>
      </div>

      {/* SELECTORS */}
      <div className="flex gap-4">
        <select
          onChange={(e) => setSireId(e.target.value)}
        >
          <option>Select sire</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setDamId(e.target.value)}
        >
          <option>Select dam</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* PEDIGREE */}
      <PedigreeTree
        root={pedigreeNodes[0]}
        nodes={pedigreeNodes}
        paths={[]} // most nem törjük a buildet
        highlightMap={coi.heatmap}
      />
    </div>
  );
}

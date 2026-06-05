"use client";

import React, { useMemo } from "react";

/**
 * 🐶 Dog + pedigree struktúra
 */
export type Dog = {
  id: string;
  name?: string;
  sire?: Dog | null;
  dam?: Dog | null;
};

type Props = {
  dogs: Dog[];
  selectedMaleId?: string | null;
  selectedFemaleId?: string | null;
};

/**
 * 🧬 ancestor gyűjtés
 */
function collectAncestors(
  node: Dog | null,
  depth = 0,
  maxDepth = 5,
  map = new Map<string, number[]>()
) {
  if (!node || depth > maxDepth) return map;

  if (!map.has(node.id)) map.set(node.id, []);
  map.get(node.id)!.push(depth);

  collectAncestors(node.sire || null, depth + 1, maxDepth, map);
  collectAncestors(node.dam || null, depth + 1, maxDepth, map);

  return map;
}

/**
 * 🧬 Wright COI
 */
export function calculateCOI(male: Dog | null, female: Dog | null): number {
  if (!male || !female) return 0;

  const maleMap = collectAncestors(male);
  const femaleMap = collectAncestors(female);

  let coi = 0;

  for (const [ancestorId, maleDepths] of maleMap.entries()) {
    if (!femaleMap.has(ancestorId)) continue;

    const femaleDepths = femaleMap.get(ancestorId)!;

    for (const n1 of maleDepths) {
      for (const n2 of femaleDepths) {
        coi += Math.pow(0.5, n1 + n2 + 1);
      }
    }
  }

  return +(coi * 100).toFixed(2);
}

/**
 * 🚨 risk szint
 */
function getRisk(coi: number) {
  if (coi < 5) return { label: "Biztonságos", color: "#16a34a" };
  if (coi < 10) return { label: "Közepes kockázat", color: "#f59e0b" };
  return { label: "Magas beltenyésztettségi kockázat", color: "#dc2626" };
}

/**
 * 🧠 MAIN COMPONENT
 */
export default function MatingPlannerClient({
  dogs,
  selectedMaleId,
  selectedFemaleId,
}: Props) {
  const male = useMemo(
    () => dogs.find((d) => d.id === selectedMaleId) || null,
    [dogs, selectedMaleId]
  );

  const female = useMemo(
    () => dogs.find((d) => d.id === selectedFemaleId) || null,
    [dogs, selectedFemaleId]
  );

  const coi = useMemo(() => {
    return calculateCOI(male, female);
  }, [male, female]);

  const risk = getRisk(coi);

  return (
    <div style={{ padding: 24 }}>
      {/* 🧬 GENETIC PANEL */}
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: `2px solid ${risk.color}`,
          background: `${risk.color}10`,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0 }}>🧬 Genetikai Kockázati Panel</h2>

        <div style={{ fontSize: 18, marginTop: 8 }}>
          COI: <b>{coi}%</b>
        </div>

        <div style={{ marginTop: 6, color: risk.color, fontWeight: 600 }}>
          {risk.label}
        </div>
      </div>

      {/* UI placeholder */}
      <div>
        <p>Válassz kant és szukát a COI számításhoz.</p>
      </div>
    </div>
  );
}

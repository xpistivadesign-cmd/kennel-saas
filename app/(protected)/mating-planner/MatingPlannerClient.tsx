"use client";

import React, { useMemo } from "react";

/**
 * 🧬 Pedigree node alap típus
 */
export type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

/**
 * 🔬 Helper: összes ős összegyűjtése mélységgel
 */
function collectAncestors(
  node: PedigreeNode | null,
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
 * 🧬 Wright’s Coefficient of Inbreeding (COI)
 * F = Σ (1/2)^(n1+n2+1) * (1 + FA)
 * FA = 0 feltételezve (ismeretlen founder inbreeding)
 */
export function calculateCOI(
  male: PedigreeNode | null,
  female: PedigreeNode | null,
  maxDepth = 5
): number {
  if (!male || !female) return 0;

  const maleMap = collectAncestors(male, 0, maxDepth);
  const femaleMap = collectAncestors(female, 0, maxDepth);

  let coi = 0;

  for (const [ancestorId, maleDepths] of maleMap.entries()) {
    if (!femaleMap.has(ancestorId)) continue;

    const femaleDepths = femaleMap.get(ancestorId)!;

    for (const n1 of maleDepths) {
      for (const n2 of femaleDepths) {
        const contribution = Math.pow(0.5, n1 + n2 + 1);
        coi += contribution;
      }
    }
  }

  return +(coi * 100).toFixed(2); // százalék
}

/**
 * 🎯 Risk kategória
 */
function getRiskLabel(coi: number) {
  if (coi < 5) return { label: "Biztonságos", color: "#16a34a" };
  if (coi < 10) return { label: "Mérsékelt kockázat", color: "#f59e0b" };
  return { label: "Magas beltenyésztettségi kockázat", color: "#dc2626" };
}

/**
 * 🧠 MAIN COMPONENT
 */
export default function MatingPlannerClient() {
  // ⚠️ itt feltételezem, hogy már van kiválasztott párod
  // cseréld le a saját state-edre
  const selectedMale: PedigreeNode | null = null;
  const selectedFemale: PedigreeNode | null = null;

  const coi = useMemo(() => {
    return calculateCOI(selectedMale, selectedFemale, 5);
  }, [selectedMale, selectedFemale]);

  const risk = getRiskLabel(coi);

  return (
    <div style={{ padding: 24 }}>
      {/* 🧬 GENETIKAI PANEL */}
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

      {/* 🧩 IDE JÖN A TÖBBI UI (dog selector, pedigree tree, stb.) */}
      <div>
        <p>Válaszd ki a kant és a szukát a COI számításhoz.</p>
      </div>
    </div>
  );
}

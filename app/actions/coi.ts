// app/actions/coi.ts

"use server";

import { wrightCOI, type AncestryNode } from "@/lib/engine/coi";

export async function calculateCOI(input: {
  individualA: string;
  individualB: string;
  pedigree: AncestryNode[];
  maxDepth?: number;
}) {
  const map = new Map(input.pedigree.map((n) => [n.id, n]));

  try {
    const coi = wrightCOI(
      input.individualA,
      input.individualB,
      map,
      input.maxDepth ?? 8
    );

    return { coi, status: "ok" as const };
  } catch {
    return { coi: 0, status: "loop_detected" as const };
  }
}

"use server";

import {
  wrightCOI,
  type AncestryNode,
} from "@/lib/supabase/coi.engine";

type PedigreeMap = Map<string, AncestryNode>;

export async function calculateCOI(input: {
  individualA: string;
  individualB: string;
  pedigree: AncestryNode[];
  maxDepth?: number;
}) {
  const pedigreeMap: PedigreeMap = new Map(
    input.pedigree.map((n) => [n.id, n])
  );

  try {
    const coi = wrightCOI(
      input.individualA,
      input.individualB,
      pedigreeMap,
      input.maxDepth ?? 8
    );

    return { coi, status: "ok" as const };
  } catch {
    return { coi: 0, status: "loop_detected" as const };
  }
}

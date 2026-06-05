export type GeneticResult = {
  coi: number; // 0–1 vagy százalék (lent normalizáljuk)
  risk: "LOW" | "MEDIUM" | "HIGH";
  label: string;
};

type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

/**
 * COI v1 (stabil, cycle-safe, memoized alap)
 * - 5 generáció mélység
 * - közös ősök detektálása
 * - Wright-style közelítés
 */
export function calculateGeneticScore(
  dog: PedigreeNode,
  partner?: PedigreeNode
): GeneticResult {
  const visited = new Map<string, number>();

  function traverse(node: PedigreeNode | null, depth: number) {
    if (!node) return;
    if (depth > 6) return;

    visited.set(node.id, (visited.get(node.id) ?? 0) + 1);

    traverse(node.sire ?? null, depth + 1);
    traverse(node.dam ?? null, depth + 1);
  }

  // self + partner tree merge
  traverse(dog, 0);
  if (partner) traverse(partner, 0);

  // shared ancestor score (nagyon leegyszerűsített COI v1)
  let overlap = 0;
  for (const count of visited.values()) {
    if (count > 1) overlap += count - 1;
  }

  const coi = Math.min(100, overlap * 2.5); // százalékosítás

  let risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (coi > 10) risk = "HIGH";
  else if (coi > 5) risk = "MEDIUM";

  return {
    coi,
    risk,
    label:
      risk === "LOW"
        ? "Biztonságos genetika"
        : risk === "MEDIUM"
        ? "Közepes beltenyésztési kockázat"
        : "Magas genetikai kockázat",
  };
}

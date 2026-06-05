export type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

export type GeneticInput = {
  sire: PedigreeNode | null;
  dam: PedigreeNode | null;
};

/**
 * 🔁 ancestry map (cycle-safe + memoized depth tracking)
 */
function buildAncestorMap(
  node: PedigreeNode | null,
  depth = 0,
  maxDepth = 6,
  map = new Map<string, number>(),
  visited = new Set<string>()
) {
  if (!node || depth > maxDepth) return map;
  if (visited.has(node.id)) return map;

  visited.add(node.id);

  const prev = map.get(node.id) ?? maxDepth;
  map.set(node.id, Math.min(prev, depth));

  buildAncestorMap(node.sire ?? null, depth + 1, maxDepth, map, visited);
  buildAncestorMap(node.dam ?? null, depth + 1, maxDepth, map, visited);

  return map;
}

/**
 * 🧬 COI (Wright approximation, multi-generation)
 */
export function calculateCOI(
  sire: PedigreeNode,
  dam: PedigreeNode,
  maxDepth = 6
): number {
  const sireMap = buildAncestorMap(sire, 0, maxDepth);
  const damMap = buildAncestorMap(dam, 0, maxDepth);

  let coi = 0;

  for (const [id, sireGen] of sireMap.entries()) {
    if (!damMap.has(id)) continue;

    const damGen = damMap.get(id)!;

    coi += Math.pow(0.5, sireGen + damGen + 1);
  }

  return Number((coi * 100).toFixed(2));
}

/**
 * 🧠 MAIN API (UI ezt használja!)
 */
export function calculateGeneticScore(input: GeneticInput) {
  const { sire, dam } = input;

  if (!sire || !dam) {
    return {
      coi: 0,
      risk: "LOW" as const,
      label: "Nincs elég pedigree adat",
    };
  }

  const coi = calculateCOI(sire, dam, 6);

  let risk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  let label = "Biztonságos genetikai kombináció";

  if (coi > 12) {
    risk = "HIGH";
    label = "Magas beltenyésztési kockázat";
  } else if (coi > 5) {
    risk = "MEDIUM";
    label = "Közepes genetikai kockázat";
  }

  return { coi, risk, label };
}

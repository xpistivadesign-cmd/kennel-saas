export type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

/**
 * 🔁 Ancestor map builder (memoized + cycle-safe)
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
 * 🧬 Wright-style COI approximation (multi-generation overlap model)
 */
export function calculateCOI(
  sire: PedigreeNode,
  dam: PedigreeNode,
  maxDepth = 6
): number {
  const sireMap = buildAncestorMap(sire, 0, maxDepth);
  const damMap = buildAncestorMap(dam, 0, maxDepth);

  let coi = 0;

  for (const [ancestorId, sireGen] of sireMap.entries()) {
    if (!damMap.has(ancestorId)) continue;

    const damGen = damMap.get(ancestorId)!;

    // Wright approximation contribution
    const contribution = Math.pow(0.5, sireGen + damGen + 1);

    coi += contribution;
  }

  return Number((coi * 100).toFixed(2));
}

/**
 * 🧠 ALIAS – FIXES YOUR BUILD ERROR
 * DogProfileClient expects this name
 */
export function calculateGeneticScore(
  sire: PedigreeNode,
  dam: PedigreeNode
): {
  coi: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
  label: string;
} {
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

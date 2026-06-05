export type DogNode = {
  id: string;
  name?: string;
  sire?: DogNode | null;
  dam?: DogNode | null;
};

//
// ===============================
// 🧬 COI ENGINE v2
// ===============================
//

export function buildAncestorGraph(
  node: DogNode | null,
  maxDepth = 8,
  visited = new Set<string>()
): Map<number, string[]> {
  const result = new Map<number, string[]>();

  function walk(n: DogNode | null, depth: number) {
    if (!n || depth > maxDepth) return;
    if (visited.has(n.id)) return;

    visited.add(n.id);

    if (!result.has(depth)) result.set(depth, []);
    result.get(depth)!.push(n.id);

    walk(n.sire || null, depth + 1);
    walk(n.dam || null, depth + 1);
  }

  walk(node, 0);

  return result;
}

export function calculateCOIv2(
  male: DogNode | null,
  female: DogNode | null,
  maxDepth = 8
): number {
  if (!male || !female) return 0;

  const maleGraph = buildAncestorGraph(male, maxDepth);
  const femaleGraph = buildAncestorGraph(female, maxDepth);

  let coi = 0;

  for (const [md, mids] of maleGraph.entries()) {
    for (const [fd, fids] of femaleGraph.entries()) {
      for (const id of mids) {
        if (!fids.includes(id)) continue;
        coi += Math.pow(0.5, md + fd + 1);
      }
    }
  }

  return +(coi * 100).toFixed(2);
}

//
// ===============================
// 🌳 HEATMAP ENGINE
// ===============================
//

export function buildFrequencyMap(node: DogNode | null) {
  const map = new Map<string, number>();

  function walk(n: DogNode | null) {
    if (!n) return;

    map.set(n.id, (map.get(n.id) || 0) + 1);

    walk(n.sire || null);
    walk(n.dam || null);
  }

  walk(node);

  return map;
}

export function getHeatColor(count: number) {
  if (count >= 4) return "#7c3aed"; // critical
  if (count === 3) return "#dc2626"; // red
  if (count === 2) return "#f59e0b"; // orange
  return "#e5e7eb"; // neutral
}

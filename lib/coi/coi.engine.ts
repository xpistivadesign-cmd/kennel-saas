export type PedigreeNode = {
  id: string;
  sireId?: string | null;
  damId?: string | null;
};

type PedigreeMap = Map<string, PedigreeNode>;

function buildMap(pedigree: PedigreeNode[]): PedigreeMap {
  return new Map(pedigree.map((n) => [n.id, n]));
}

// simple Wright-style coefficient approximation (safe version)
function traverse(
  id: string,
  map: PedigreeMap,
  depth: number,
  visited: Set<string>
): number {
  if (!id || depth === 0) return 0;
  if (visited.has(id)) return 0; // LOOP DETECTION

  const node = map.get(id);
  if (!node) return 0;

  visited.add(id);

  const sire = node.sireId
    ? traverse(node.sireId, map, depth - 1, visited)
    : 0;

  const dam = node.damId
    ? traverse(node.damId, map, depth - 1, visited)
    : 0;

  visited.delete(id);

  return 0.5 * (sire + dam + 1);
}

export function wrightCOI(
  pedigree: PedigreeNode[],
  rootId: string,
  maxDepth = 6
): number {
  const map = buildMap(pedigree);
  return traverse(rootId, map, maxDepth, new Set());
}

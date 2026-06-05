// lib/coi/coi.engine.ts

export type IndividualId = string;

export type AncestryNode = {
  id: IndividualId;
  sireId?: IndividualId | null;
  damId?: IndividualId | null;
};

export type PedigreeMap = Map<IndividualId, AncestryNode>;

class LoopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoopError";
  }
}

/**
 * Global memoization cache for ancestry expansion
 * (safe because pure function input = pedigree snapshot)
 */
const ancestryCache = new Map<string, AncestryNode[]>();

/**
 * Clears cache (useful for long-running server processes or tests)
 */
export function clearCOICache() {
  ancestryCache.clear();
}

/**
 * Build ancestry tree (DFS up to maxDepth)
 * - detects loops
 * - memoized for performance
 */
export function buildAncestryChain(
  id: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8,
  visited = new Set<string>(),
  depth = 0
): AncestryNode[] {
  if (!id) return [];
  if (depth >= maxDepth) return [];

  if (visited.has(id)) {
    throw new LoopError(`Circular pedigree detected at node: ${id}`);
  }

  const cached = ancestryCache.get(id);
  if (cached) return cached;

  const node = pedigree.get(id);
  if (!node) return [];

  visited.add(id);

  const result: AncestryNode[] = [node];

  if (node.sireId) {
    result.push(
      ...buildAncestryChain(node.sireId, pedigree, maxDepth, visited, depth + 1)
    );
  }

  if (node.damId) {
    result.push(
      ...buildAncestryChain(node.damId, pedigree, maxDepth, visited, depth + 1)
    );
  }

  visited.delete(id);

  ancestryCache.set(id, result);

  return result;
}

/**
 * Wright Coefficient of Inbreeding (F)
 *
 * Simplified path-based implementation:
 * F = Σ (1/2)^(n1 + n2 + 1)
 *
 * where:
 * n1 = distance from A to common ancestor
 * n2 = distance from B to common ancestor
 */
export function wrightCOI(
  individualA: IndividualId,
  individualB: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8
): number {
  const ancestorsA = buildAncestryChain(individualA, pedigree, maxDepth);
  const ancestorsB = buildAncestryChain(individualB, pedigree, maxDepth);

  // Map: ancestorId -> generation index (distance)
  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();

  for (let i = 0; i < ancestorsA.length; i++) {
    const id = ancestorsA[i].id;
    if (!mapA.has(id)) mapA.set(id, i);
  }

  for (let j = 0; j < ancestorsB.length; j++) {
    const id = ancestorsB[j].id;
    if (!mapB.has(id)) mapB.set(id, j);
  }

  let F = 0;

  for (const [id, i] of mapA.entries()) {
    const j = mapB.get(id);
    if (j === undefined) continue;

    // Wright path coefficient contribution
    const term = Math.pow(0.5, i + j + 1);

    F += term;
  }

  // clamp to valid probability range
  return Math.min(1, Math.max(0, F));
}

/**
 * Optional utility: normalize pedigree input
 */
export function toPedigreeMap(nodes: AncestryNode[]): PedigreeMap {
  return new Map(nodes.map((n) => [n.id, n]));
}

/**
 * Optional debug helper
 */
export function explainCOI(
  individualA: string,
  individualB: string,
  pedigree: PedigreeMap,
  maxDepth = 8
) {
  const a = buildAncestryChain(individualA, pedigree, maxDepth);
  const b = buildAncestryChain(individualB, pedigree, maxDepth);

  return {
    aSize: a.length,
    bSize: b.length,
    shared: a.filter((x) => b.some((y) => y.id === x.id)).map((x) => x.id),
  };
}

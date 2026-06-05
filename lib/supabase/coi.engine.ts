export type IndividualId = string;

export type AncestryNode = {
  id: IndividualId;
  sireId?: IndividualId | null;
  damId?: IndividualId | null;
};

type PedigreeMap = Map<IndividualId, AncestryNode>;

class LoopError extends Error {}

const ancestryCache = new Map<string, AncestryNode[]>();

export function buildAncestryChain(
  id: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8,
  visited = new Set<string>(),
  depth = 0
): AncestryNode[] {
  if (!id || depth > maxDepth) return [];

  if (visited.has(id)) {
    throw new LoopError("Pedigree loop detected");
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

export function wrightCOI(
  a: IndividualId,
  b: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8
): number {
  const ancA = buildAncestryChain(a, pedigree, maxDepth);
  const ancB = buildAncestryChain(b, pedigree, maxDepth);

  const mapA = new Map(ancA.map((n, i) => [n.id, i]));
  const mapB = new Map(ancB.map((n, i) => [n.id, i]));

  let F = 0;

  for (const [id, i] of mapA) {
    const j = mapB.get(id);
    if (j === undefined) continue;

    F += Math.pow(0.5, i + j + 1);
  }

  return Math.min(1, Math.max(0, F));
}

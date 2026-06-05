// lib/engine/coi.ts

export type IndividualId = string;

export type AncestryNode = {
  id: IndividualId;
  sireId?: IndividualId | null;
  damId?: IndividualId | null;
};

type PedigreeMap = Map<string, AncestryNode>;

class LoopError extends Error {}

const cache = new Map<string, AncestryNode[]>();

export function buildAncestry(
  id: string,
  pedigree: PedigreeMap,
  maxDepth = 8,
  visited = new Set<string>(),
  depth = 0
): AncestryNode[] {
  if (!id || depth > maxDepth) return [];

  if (visited.has(id)) {
    throw new LoopError("cycle");
  }

  const cached = cache.get(id);
  if (cached) return cached;

  const node = pedigree.get(id);
  if (!node) return [];

  visited.add(id);

  const result: AncestryNode[] = [node];

  if (node.sireId) {
    result.push(
      ...buildAncestry(node.sireId, pedigree, maxDepth, visited, depth + 1)
    );
  }

  if (node.damId) {
    result.push(
      ...buildAncestry(node.damId, pedigree, maxDepth, visited, depth + 1)
    );
  }

  visited.delete(id);

  cache.set(id, result);

  return result;
}

export function wrightCOI(
  a: string,
  b: string,
  pedigree: PedigreeMap,
  maxDepth = 8
) {
  const aAnc = buildAncestry(a, pedigree, maxDepth);
  const bAnc = buildAncestry(b, pedigree, maxDepth);

  const mapA = new Map(aAnc.map((x, i) => [x.id, i]));
  const mapB = new Map(bAnc.map((x, i) => [x.id, i]));

  let F = 0;

  for (const [id, i] of mapA) {
    const j = mapB.get(id);
    if (j === undefined) continue;

    F += Math.pow(0.5, i + j + 1);
  }

  return Math.min(1, Math.max(0, F));
}

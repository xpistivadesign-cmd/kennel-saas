import "server-only";

type IndividualId = string;

export type AncestryNode = {
  id: IndividualId;
  sireId?: IndividualId | null;
  damId?: IndividualId | null;
};

type PedigreeMap = Map<IndividualId, AncestryNode>;

/**
 * Memoized ancestry graph node cache
 */
const ancestryCache = new Map<IndividualId, AncestryNode[]>();

/**
 * Global computation guard (loop detection)
 */
class LoopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoopError";
  }
}

/**
 * Fetch ancestry chain up to maxDepth (6–8 generations typical)
 * LOOP SAFE: detects circular references immediately
 */
function buildAncestryChain(
  id: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8,
  visited = new Set<IndividualId>(),
  depth = 0
): AncestryNode[] {
  if (!id) return [];

  if (visited.has(id)) {
    throw new LoopError(`Circular pedigree detected at node: ${id}`);
  }

  if (depth >= maxDepth) return [];

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
 * Wright's Coefficient of Inbreeding (F)
 * Simplified path-based implementation:
 *
 * F = Σ (1/2)^(n1+n2+1) * (1 + FA)
 */
function wrightPathCoefficient(
  individualA: IndividualId,
  individualB: IndividualId,
  pedigree: PedigreeMap,
  maxDepth = 8
): number {
  const ancestorsA = buildAncestryChain(individualA, pedigree, maxDepth);
  const ancestorsB = buildAncestryChain(individualB, pedigree, maxDepth);

  const mapA = new Map<string, number>();
  const mapB = new Map<string, number>();

  ancestorsA.forEach((a, i) => mapA.set(a.id, i));
  ancestorsB.forEach((b, i) => mapB.set(b.id, i));

  let F = 0;

  for (const [id, i] of mapA.entries()) {
    if (!mapB.has(id)) continue;

    const j = mapB.get(id)!;

    // Wright path term approximation
    const term = Math.pow(0.5, i + j + 1);

    F += term;
  }

  return Math.min(Math.max(F, 0), 1);
}

/**
 * PUBLIC SERVER ACTION
 * Called directly from client component (Next.js Server Actions)
 */
export async function calculateCOI(input: {
  individualA: string;
  individualB: string;
  pedigree: AncestryNode[];
  maxDepth?: number;
}): Promise<{
  coi: number;
  status: "ok" | "loop_detected";
}> {
  "use server";

  const pedigreeMap: PedigreeMap = new Map(
    input.pedigree.map((n) => [n.id, n])
  );

  try {
    const coi = wrightPathCoefficient(
      input.individualA,
      input.individualB,
      pedigreeMap,
      input.maxDepth ?? 8
    );

    return {
      coi,
      status: "ok",
    };
  } catch (e) {
    if (e instanceof LoopError) {
      return {
        coi: 0,
        status: "loop_detected",
      };
    }
    throw e;
  }
}

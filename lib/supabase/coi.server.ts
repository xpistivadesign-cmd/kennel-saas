export type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

export type COIPath = {
  ancestorId: string;
  sirePath: string[];
  damPath: string[];
  weight: number;
};

export type COIResult = {
  coi: number;
  label: string;
  risk: "LOW" | "MEDIUM" | "HIGH";

  heatmap: Record<string, number>;
  pathways: COIPath[];
};

/**
 * DAG-safe memo cache
 */
const memo = new Map<string, PedigreeNode[]>();

function getAncestors(
  node: PedigreeNode | null | undefined,
  depth = 0,
  maxDepth = 8,
  visited = new Set<string>()
): PedigreeNode[] {
  if (!node || depth > maxDepth) return [];

  if (visited.has(node.id)) return [];
  visited.add(node.id);

  const key = `${node.id}:${depth}`;

  if (memo.has(key)) return memo.get(key)!;

  const sire = getAncestors(node.sire, depth + 1, maxDepth, visited);
  const dam = getAncestors(node.dam, depth + 1, maxDepth, visited);

  const result = [node, ...sire, ...dam];

  memo.set(key, result);

  return result;
}

/**
 * Build full ancestry paths (Wright decomposition core)
 */
function buildPaths(
  node: PedigreeNode | null,
  target: string,
  path: string[] = [],
  depth = 0,
  maxDepth = 8,
  visited = new Set<string>()
): string[][] {
  if (!node || depth > maxDepth) return [];

  if (node.id === target) {
    return [[...path, node.id]];
  }

  if (visited.has(node.id)) return [];
  visited.add(node.id);

  const newPath = [...path, node.id];

  return [
    ...buildPaths(node.sire ?? null, target, newPath, depth + 1, maxDepth, visited),
    ...buildPaths(node.dam ?? null, target, newPath, depth + 1, maxDepth, visited),
  ];
}

/**
 * True Wright COI approximation via path decomposition
 */
export function calculateCOIv3(
  sire: PedigreeNode,
  dam: PedigreeNode
): COIResult {
  const sireAnc = getAncestors(sire);
  const damAnc = getAncestors(dam);

  const heatmap: Record<string, number> = {};
  const pathways: COIPath[] = [];

  const damSet = new Set(damAnc.map((n) => n.id));

  let total = 0;

  for (const a of sireAnc) {
    if (!damSet.has(a.id)) continue;

    const sirePaths = buildPaths(sire, a.id);
    const damPaths = buildPaths(dam, a.id);

    for (const sp of sirePaths) {
      for (const dp of damPaths) {
        const depthFactor =
          (sp.length + dp.length) > 0
            ? 1 / Math.pow(2, sp.length + dp.length)
            : 0;

        total += depthFactor;

        pathways.push({
          ancestorId: a.id,
          sirePath: sp,
          damPath: dp,
          weight: depthFactor,
        });
      }
    }

    heatmap[a.id] = (heatmap[a.id] || 0) + 1;
  }

  const coi = Math.min(100, Math.max(0, total * 100));

  let label = "Genetically Safe";
  let risk: COIResult["risk"] = "LOW";

  if (coi > 10) {
    label = "Moderate Inbreeding Risk";
    risk = "MEDIUM";
  }
  if (coi > 20) {
    label = "High Genetic Risk";
    risk = "HIGH";
  }

  return {
    coi: Number(coi.toFixed(2)),
    label,
    risk,
    heatmap,
    pathways,
  };
}

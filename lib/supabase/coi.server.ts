type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

export type COIResult = {
  coi: number; // 0–100
  label: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  heatmap: Record<string, number>; // ancestorId -> occurrence count
};

// Memo cache (performance critical)
const ancestorCache = new Map<string, PedigreeNode[]>();

function collectAncestors(
  node: PedigreeNode | null | undefined,
  depth = 0,
  maxDepth = 8,
  cacheKey = ""
): PedigreeNode[] {
  if (!node || depth > maxDepth) return [];

  const key = node.id + ":" + depth + ":" + cacheKey;

  if (ancestorCache.has(key)) {
    return ancestorCache.get(key)!;
  }

  const left = collectAncestors(node.sire, depth + 1, maxDepth, key);
  const right = collectAncestors(node.dam, depth + 1, maxDepth, key);

  const result = [node, ...left, ...right];

  ancestorCache.set(key, result);

  return result;
}

/**
 * Wright's Coefficient of Inbreeding (simplified pedigree-based approximation)
 */
export function calculateCOIv2(
  sire: PedigreeNode,
  dam: PedigreeNode
): COIResult {
  const sireAncestors = collectAncestors(sire);
  const damAncestors = collectAncestors(dam);

  const heatmap: Record<string, number> = {};

  sireAncestors.forEach((a) => {
    heatmap[a.id] = (heatmap[a.id] || 0) + 1;
  });

  damAncestors.forEach((a) => {
    heatmap[a.id] = (heatmap[a.id] || 0) + 1;
  });

  // common ancestors
  const sireSet = new Set(sireAncestors.map((a) => a.id));

  let sharedCount = 0;
  let totalPaths = 0;

  for (const damA of damAncestors) {
    if (sireSet.has(damA.id)) {
      sharedCount++;

      // path weight (depth approximation)
      totalPaths += 1 / Math.pow(2, 2);
    }
  }

  // Wright approximation (pedigree-based heuristic)
  const coiRaw = totalPaths * 100;

  const coi = Math.min(100, Math.max(0, coiRaw));

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
  };
}

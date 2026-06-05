"use client";

type PedigreeNode = {
  id: string;
  name?: string;
  sire?: PedigreeNode | null;
  dam?: PedigreeNode | null;
};

type Props = {
  root: PedigreeNode;
};

function buildFrequencyMap(node: PedigreeNode | null, map: Map<string, number>) {
  if (!node) return;

  map.set(node.id, (map.get(node.id) ?? 0) + 1);

  buildFrequencyMap(node.sire ?? null, map);
  buildFrequencyMap(node.dam ?? null, map);
}

function getHeatColor(count: number) {
  if (count >= 3) return "#7c3aed"; // deep purple
  if (count === 2) return "#ef4444"; // red
  return "#e5e7eb"; // gray
}

function NodeBox({ node, freqMap }: any) {
  const count = freqMap.get(node.id) ?? 0;
  const color = getHeatColor(count);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: 8,
        margin: 4,
        background: color,
        borderRadius: 6,
        color: count >= 2 ? "white" : "black",
      }}
    >
      {node.name ?? node.id}
      {count > 1 && (
        <span style={{ marginLeft: 6, fontSize: 10 }}>
          ({count}×)
        </span>
      )}
    </div>
  );
}

function renderTree(node: PedigreeNode | null, freqMap: Map<string, number>) {
  if (!node) return null;

  return (
    <div style={{ marginLeft: 20 }}>
      <NodeBox node={node} freqMap={freqMap} />

      <div style={{ display: "flex" }}>
        {renderTree(node.sire ?? null, freqMap)}
        {renderTree(node.dam ?? null, freqMap)}
      </div>
    </div>
  );
}

export default function PedigreeTree({ root }: Props) {
  const freqMap = new Map<string, number>();

  buildFrequencyMap(root, freqMap);

  return (
    <div className="p-4">
      <div className="font-bold mb-2">
        🌳 Pedigree Heatmap
      </div>

      {renderTree(root, freqMap)}
    </div>
  );
}

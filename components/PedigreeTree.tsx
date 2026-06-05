"use client";

import React, { useMemo } from "react";

export type PedigreePath = {
  sirePath: string[];
  damPath: string[];
};

export type PedigreeNode = {
  id: string;
  name: string;
  sireId?: string | null;
  damId?: string | null;
};

export type PedigreeTreeProps = {
  root: PedigreeNode;
  nodes: PedigreeNode[];
  paths: PedigreePath[]; // 🔥 EZ HIÁNYZOTT
  highlightMap?: Record<string, number>; // COI heatmap input
};

function isCriticalEdge(
  from: string,
  to: string,
  paths: PedigreePath[]
) {
  return paths.some(
    (p) =>
      p.sirePath.includes(from) &&
      p.damPath.includes(to)
  );
}

function getHeatColor(intensity: number) {
  if (intensity > 3) return "#ff3b30"; // red
  if (intensity > 1) return "#ff9500"; // orange
  return "#34c759"; // green
}

export default function PedigreeTree({
  root,
  nodes,
  paths = [],
  highlightMap = {},
}: PedigreeTreeProps) {
  const nodeMap = useMemo(() => {
    const map = new Map<string, PedigreeNode>();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);

  return (
    <svg width="100%" height="600" className="bg-white">
      {/* EDGES */}
      {nodes.map((node) => {
        if (!node.sireId) return null;

        const critical = isCriticalEdge(
          node.sireId,
          node.id,
          paths
        );

        return (
          <line
            key={`${node.sireId}-${node.id}`}
            x1={100}
            y1={100}
            x2={200}
            y2={200}
            stroke={critical ? "red" : "#ccc"}
            strokeWidth={critical ? 3 : 1}
            opacity={critical ? 0.8 : 0.3}
          />
        );
      })}

      {/* NODES */}
      {nodes.map((node, i) => {
        const intensity = highlightMap[node.id] || 0;

        return (
          <g key={node.id} transform={`translate(${i * 80}, 100)`}>
            <rect
              width={60}
              height={40}
              fill={getHeatColor(intensity)}
              opacity={0.9}
              rx={6}
            />
            <text
              x={30}
              y={25}
              textAnchor="middle"
              fontSize={10}
              fill="white"
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

"use client";

import type { PedigreeNode } from "@/lib/supabase/dogs";

type Props = {
  root: PedigreeNode;
};

export default function PedigreeTree({ root }: Props) {
  return (
    <div className="flex gap-8 overflow-x-auto p-4">
      <TreeNode node={root} />
    </div>
  );
}

function TreeNode({ node }: { node: PedigreeNode }) {
  return (
    <div className="flex flex-col items-center min-w-[200px]">
      {/* 🐶 Node box */}
      <div className="border rounded-lg p-3 shadow-sm bg-white w-full text-center">
        <div className="font-bold">{node.name}</div>
        <div className="text-xs text-gray-500">{node.breed}</div>
        <div className="text-xs">
          {node.gender === "male" ? "♂" : node.gender === "female" ? "♀" : ""}
        </div>
      </div>

      {/* 🌿 branches */}
      {(node.sire || node.dam) && (
        <div className="flex gap-6 mt-6">
          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-2">Sire</div>
            {node.sire ? (
              <TreeNode node={node.sire} />
            ) : (
              <div className="text-gray-300 text-sm">—</div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-2">Dam</div>
            {node.dam ? (
              <TreeNode node={node.dam} />
            ) : (
              <div className="text-gray-300 text-sm">—</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

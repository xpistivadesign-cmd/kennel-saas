"use client";

import type { PedigreeNode } from "@/lib/supabase/dogs";

type Props = {
  root: PedigreeNode;
};

export default function PedigreeTree({ root }: Props) {
  return (
    <div className="overflow-x-auto p-6">
      <div className="flex gap-10 items-start">
        <GenerationColumn nodes={[root]} />
      </div>
    </div>
  );
}

function GenerationColumn({
  nodes,
}: {
  nodes: PedigreeNode[];
}) {
  if (!nodes.length) return null;

  const nextGeneration: PedigreeNode[] = [];

  nodes.forEach((node) => {
    if (node.sire) nextGeneration.push(node.sire);
    if (node.dam) nextGeneration.push(node.dam);
  });

  return (
    <>
      <div className="flex flex-col gap-6">
        {nodes.map((node) => (
          <DogCard key={`${node.id}-${node.generation}`} dog={node} />
        ))}
      </div>

      {nextGeneration.length > 0 && (
        <GenerationColumn nodes={nextGeneration} />
      )}
    </>
  );
}

function DogCard({ dog }: { dog: PedigreeNode }) {
  return (
    <div className="w-64 rounded-xl border bg-white p-4 shadow-sm">
      <div className="font-semibold text-lg">{dog.name}</div>

      <div className="text-sm text-gray-500">
        {dog.breed ?? "Unknown breed"}
      </div>

      <div className="text-sm mt-1">
        {dog.gender === "male" && "♂ Male"}
        {dog.gender === "female" && "♀ Female"}
      </div>

      {dog.reg_number && (
        <div className="text-xs text-gray-400 mt-2">
          Reg: {dog.reg_number}
        </div>
      )}

      {dog.birth_date && (
        <div className="text-xs text-gray-400">
          Born: {dog.birth_date}
        </div>
      )}

      <div className="text-xs text-blue-500 mt-2">
        Generation {dog.generation}
      </div>
    </div>
  );
}

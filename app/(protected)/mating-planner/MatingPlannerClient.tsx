"use client";

import { useMemo, useState } from "react";
import type { Dog, PedigreeNode } from "@/lib/supabase/dogs";
import PedigreeTree from "@/components/PedigreeTree";

type Props = {
  dogs: Dog[];
};

export default function MatingPlannerClient({ dogs }: Props) {
  const [sireId, setSireId] = useState<string>("");
  const [damId, setDamId] = useState<string>("");

  const sires = useMemo(
    () => dogs.filter((d) => d.gender === "male"),
    [dogs]
  );

  const dams = useMemo(
    () => dogs.filter((d) => d.gender === "female"),
    [dogs]
  );

  const virtualTree = useMemo((): PedigreeNode | null => {
    const sire = dogs.find((d) => d.id === sireId);
    const dam = dogs.find((d) => d.id === damId);

    if (!sire || !dam) return null;

    return {
      id: "virtual-litter",
      name: "Planned Litter",
      breed: sire.breed || dam.breed,
      gender: undefined,
      sire,
      dam,
      generation: 0,
    };
  }, [sireId, damId, dogs]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Mating Planner</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={sireId}
          onChange={(e) => setSireId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select sire</option>
          {sires.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={damId}
          onChange={(e) => setDamId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select dam</option>
          {dams.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {virtualTree && (
        <PedigreeTree root={virtualTree} />
      )}
    </div>
  );
}

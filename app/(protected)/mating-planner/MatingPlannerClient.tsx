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

  const males = useMemo(
    () => dogs.filter((d) => d.gender === "male"),
    [dogs]
  );

  const females = useMemo(
    () => dogs.filter((d) => d.gender === "female"),
    [dogs]
  );

  const virtualTree: PedigreeNode | null = useMemo(() => {
    if (!sireId && !damId) return null;

    const sire = dogs.find((d) => d.id === sireId) ?? null;
    const dam = dogs.find((d) => d.id === damId) ?? null;

    return {
      id: "virtual",
      name: "Planned Litter",
      breed: sire?.breed || dam?.breed || "Mixed",
      gender: undefined,
      sire_id: sire?.id,
      dam_id: dam?.id,
      sire: sire
        ? { ...sire, generation: 2 }
        : null,
      dam: dam
        ? { ...dam, generation: 2 }
        : null,
      generation: 1,
    };
  }, [sireId, damId, dogs]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <select
          value={sireId}
          onChange={(e) => setSireId(e.target.value)}
          className="border p-2"
        >
          <option value="">Select male</option>
          {males.map((d) => (
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
          <option value="">Select female</option>
          {females.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {virtualTree && (
        <div className="border rounded-xl bg-gray-50">
          <PedigreeTree root={virtualTree} />
        </div>
      )}
    </div>
  );
}

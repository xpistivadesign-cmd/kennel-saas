"use client";

import { useState, useTransition } from "react";
import {
  markLitterBorn,
  createLitter,
  type Litter,
} from "@/app/actions/litters";

type Props = {
  initialLitters: Litter[];
};

export default function LittersClient({ initialLitters }: Props) {
  const [litters, setLitters] = useState(initialLitters);
  const [isPending, startTransition] = useTransition();

  const [matingId, setMatingId] = useState("");
  const [kennelId, setKennelId] = useState("");

  function handleCreate() {
    startTransition(async () => {
      await createLitter({
        mating_id: matingId,
        kennel_id: kennelId,
      });

      setLitters((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).slice(2),
          mating_id: matingId,
          kennel_id: kennelId,
          birth_date: null,
          puppies_count: null,
          status: "planned",
          created_at: new Date().toISOString(),
        },
      ]);
    });
  }

  function handleMarkBorn(id: string) {
    startTransition(async () => {
      await markLitterBorn({
        litterId: id,
        puppiesCount: 1,
      });

      setLitters((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: "born", puppies_count: 1 }
            : l
        )
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* CREATE */}
      <div className="border p-4 space-y-2">
        <h2 className="font-semibold">Create Litter</h2>

        <input
          placeholder="Mating ID"
          value={matingId}
          onChange={(e) => setMatingId(e.target.value)}
          className="border p-2 mr-2"
        />

        <input
          placeholder="Kennel ID"
          value={kennelId}
          onChange={(e) => setKennelId(e.target.value)}
          className="border p-2 mr-2"
        />

        <button
          onClick={handleCreate}
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2"
        >
          Create Litter
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {litters.map((litter) => (
          <div
            key={litter.id}
            className="border p-3 flex justify-between items-center"
          >
            <div>
              <div>Mating: {litter.mating_id}</div>
              <div>Kennel: {litter.kennel_id}</div>
              <div>Status: {litter.status}</div>
              <div>Puppies: {litter.puppies_count ?? "-"}</div>
            </div>

            {litter.status === "planned" && (
              <button
                onClick={() => handleMarkBorn(litter.id)}
                className="bg-green-600 text-white px-3 py-1"
              >
                Mark Born
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

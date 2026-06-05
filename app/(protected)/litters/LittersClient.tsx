"use client";

import { useState, useTransition } from "react";
import {
  markLitterBorn,
  createLitter,
  type Litter,
} from "@/app/actions/litters";

type Props = {
  litters: Litter[];
};

export default function LittersClient({ litters: initial }: Props) {
  const [litters, setLitters] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const [matingId, setMatingId] = useState("");
  const [kennelId, setKennelId] = useState("");

  async function handleCreate() {
    if (!matingId || !kennelId) return;

    startTransition(async () => {
      const newLitter = await createLitter({
        mating_id: matingId,
        kennel_id: kennelId,
      });

      setLitters((prev) => [newLitter, ...prev]);

      setMatingId("");
      setKennelId("");
    });
  }

  async function handleMarkBorn(id: string) {
    startTransition(async () => {
      await markLitterBorn({
        litterId: id,
        puppies: [{ name: "Unknown", sex: "male" }],
      });

      setLitters((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: "born",
                puppies_count: 1,
                birth_date: new Date().toISOString(),
              }
            : l
        )
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="border p-4 bg-white rounded">
        <input
          value={matingId}
          onChange={(e) => setMatingId(e.target.value)}
          placeholder="Mating ID"
          className="border p-2 w-full mb-2"
        />
        <input
          value={kennelId}
          onChange={(e) => setKennelId(e.target.value)}
          placeholder="Kennel ID"
          className="border p-2 w-full mb-2"
        />

        <button onClick={handleCreate} disabled={isPending}>
          Create Litter
        </button>
      </div>

      {litters.map((l) => (
        <div key={l.id} className="border p-3">
          <div>{l.mating_id}</div>
          <div>{l.kennel_id}</div>

          <div>{l.status}</div>

          <button
            disabled={isPending || l.status !== "planned"}
            onClick={() => handleMarkBorn(l.id)}
          >
            Mark Born
          </button>
        </div>
      ))}
    </div>
  );
}

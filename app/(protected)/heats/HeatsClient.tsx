"use client";

import { useState } from "react";
import {
  addProgesteroneTest,
  createHeatRecord,
} from "@/app/actions/heats";

export default function HeatsClient({
  heats,
}: {
  heats: any[];
}) {
  const [dogId, setDogId] = useState("");
  const [startDate, setStartDate] = useState("");

  async function createHeat() {
    await createHeatRecord({
      dog_id: dogId,
      start_date: startDate,
    });
  }

  return (
    <div className="space-y-6">
      <div className="border p-4">
        <input
          placeholder="Dog ID"
          value={dogId}
          onChange={(e) => setDogId(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 w-full mt-2"
        />

        <button onClick={createHeat} className="mt-2 bg-black text-white p-2">
          Create Heat
        </button>
      </div>

      {heats.map((h) => (
        <div key={h.id} className="border p-4">
          <div>Dog: {h.dog_id}</div>
          <div>Status: {h.status}</div>

          <button
            onClick={() =>
              addProgesteroneTest({
                heat_id: h.id,
                test_date: new Date().toISOString(),
                value: Math.random() * 20,
              })
            }
            className="mt-2 bg-blue-500 text-white p-2"
          >
            Add Progesterone Test
          </button>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { markLitterBorn } from "@/app/actions/litters";

type PuppyInput = {
  name: string;
  gender: "male" | "female";
  color?: string;
};

export default function LittersClient({
  litters,
}: {
  litters: any[];
}) {
  const [openLitterId, setOpenLitterId] = useState<string | null>(null);

  const [puppies, setPuppies] = useState<PuppyInput[]>([
    { name: "", gender: "male", color: "" },
  ]);

  return (
    <div className="space-y-6">
      {litters.map((litter) => (
        <div key={litter.id} className="border p-4 rounded">
          <div>
            <strong>Litter:</strong> {litter.id}
          </div>

          <div>
            Status: <strong>{litter.status}</strong>
          </div>

          <button
            onClick={() => setOpenLitterId(litter.id)}
            className="bg-green-600 text-white px-3 py-1 mt-2"
          >
            Mark Born
          </button>

          {openLitterId === litter.id && (
            <div className="mt-4 border-t pt-4 space-y-2">
              <h3 className="font-bold">Add Puppies</h3>

              {puppies.map((p, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    placeholder="Name"
                    value={p.name}
                    onChange={(e) => {
                      const copy = [...puppies];
                      copy[idx].name = e.target.value;
                      setPuppies(copy);
                    }}
                  />

                  <select
                    value={p.gender}
                    onChange={(e) => {
                      const copy = [...puppies];
                      copy[idx].gender = e.target.value as any;
                      setPuppies(copy);
                    }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  <input
                    placeholder="Color"
                    value={p.color}
                    onChange={(e) => {
                      const copy = [...puppies];
                      copy[idx].color = e.target.value;
                      setPuppies(copy);
                    }}
                  />
                </div>
              ))}

              <button
                onClick={() =>
                  setPuppies([
                    ...puppies,
                    { name: "", gender: "male", color: "" },
                  ])
                }
                className="text-blue-600"
              >
                + Add Puppy
              </button>

              <div>
                <button
                  onClick={async () => {
                    await markLitterBorn({
                      litterId: litter.id,
                      puppies,
                    });

                    setOpenLitterId(null);
                    setPuppies([
                      { name: "", gender: "male", color: "" },
                    ]);
                  }}
                  className="bg-black text-white px-4 py-2 mt-2"
                >
                  Confirm Birth
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

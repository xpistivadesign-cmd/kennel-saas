"use client";

import { useState } from "react";
import { calculateCOI } from "@/lib/supabase/coi.server";

type Props = {
  pedigree: {
    id: string;
    sireId?: string | null;
    damId?: string | null;
  }[];
};

export default function MatingPlannerClient({ pedigree }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setLoading(true);
    setStatus("calculating");

    try {
      const res = await calculateCOI({
        individualA: a,
        individualB: b,
        pedigree,
        maxDepth: 8,
      });

      setResult(res.coi);
      setStatus(res.status);
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Mating Planner COI Engine</h2>

      <input
        className="border p-2"
        placeholder="Individual A ID"
        value={a}
        onChange={(e) => setA(e.target.value)}
      />

      <input
        className="border p-2"
        placeholder="Individual B ID"
        value={b}
        onChange={(e) => setB(e.target.value)}
      />

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2"
      >
        {loading ? "Calculating..." : "Calculate COI"}
      </button>

      <div className="pt-4">
        <div>Status: {status}</div>
        <div>
          COI: {result !== null ? result.toFixed(6) : "—"}
        </div>
      </div>
    </div>
  );
}

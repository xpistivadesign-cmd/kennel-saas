"use client";

import { useState } from "react";
import { calculateCOI } from "@/app/actions/coi.actions";

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
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  async function handleCalculate() {
    setLoading(true);

    const res = await calculateCOI({
      individualA: a,
      individualB: b,
      pedigree,
      maxDepth: 8,
    });

    setResult(res.coi);
    setStatus(res.status);
    setLoading(false);
  }

  return (
    <div className="p-4 space-y-3">
      <input value={a} onChange={(e) => setA(e.target.value)} placeholder="A" />
      <input value={b} onChange={(e) => setB(e.target.value)} placeholder="B" />

      <button onClick={handleCalculate} disabled={loading}>
        Calculate
      </button>

      <div>Status: {status}</div>
      <div>COI: {result ?? "-"}</div>
    </div>
  );
}

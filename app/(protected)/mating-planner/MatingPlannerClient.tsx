"use client";

import { useState } from "react";
import { calculateCOI } from "@/app/actions/coi";

export default function MatingPlannerClient({ pedigree }: any) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [result, setResult] = useState<number | null>(null);

  async function run() {
    const res = await calculateCOI({
      individualA: a,
      individualB: b,
      pedigree,
      maxDepth: 8,
    });

    setResult(res.coi);
  }

  return (
    <div>
      <input onChange={(e) => setA(e.target.value)} />
      <input onChange={(e) => setB(e.target.value)} />

      <button onClick={run}>Run</button>

      <div>{result ?? "-"}</div>
    </div>
  );
}

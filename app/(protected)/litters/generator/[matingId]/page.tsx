"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { addDays, format } from "date-fns";

type PuppyDraft = {
  sex: "male" | "female";
  color: string;
  name: string;
};

export default function LitterGeneratorPage({
  params,
}: {
  params: { matingId: string };
}) {
  const [loading, setLoading] = useState(true);
  const [mating, setMating] = useState<any>(null);
  const [phase, setPhase] = useState<
    "idle" | "pregnant" | "birth" | "complete"
  >("idle");

  const [puppies, setPuppies] = useState<PuppyDraft[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("matings")
      .select("*")
      .eq("id", params.matingId)
      .single();

    setMating(data);

    setPhase("pregnant");
    setLoading(false);
  }

  function generateDraftLitter() {
    // 🧠 AI-like deterministic simulation (no backend needed)
    const count = 5 + Math.floor(Math.random() * 4); // 5–8 puppies

    const colors = ["black", "brown", "cream", "gold", "white"];

    const draft: PuppyDraft[] = Array.from({ length: count }).map(
      (_, i) => ({
        sex: Math.random() > 0.5 ? "male" : "female",
        color: colors[Math.floor(Math.random() * colors.length)],
        name: `Pup ${i + 1}`,
      })
    );

    setPuppies(draft);
  }

  async function startBirth() {
    setAnimating(true);
    setPhase("birth");

    // cinematic delay sequence
    await new Promise((r) => setTimeout(r, 800));
    generateDraftLitter();

    await new Promise((r) => setTimeout(r, 1200));

    setPhase("complete");
    setAnimating(false);
  }

  async function commitToDatabase() {
    // 1. create litter
    const { data: litter } = await supabase
      .from("litters")
      .insert({
        mating_id: mating.id,
        birth_date: new Date().toISOString().split("T")[0],
        male_count: puppies.filter((p) => p.sex === "male").length,
        female_count: puppies.filter((p) => p.sex === "female").length,
        status: "born",
      })
      .select()
      .single();

    // 2. create puppies
    for (let i = 0; i < puppies.length; i++) {
      const p = puppies[i];

      await supabase.from("puppies").insert({
        litter_id: litter.id,
        sex: p.sex,
        color: p.color,
        name: p.name,
        birth_order: i + 1,
        status: "available",
      });
    }

    alert("Litter successfully created 🐾");
  }

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Initializing breeding system...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          🧬 Litter Generator
        </h1>
        <p className="text-gray-500">
          Mating ID: {mating.id}
        </p>
      </div>

      {/* STATUS PANEL */}
      <div className="grid grid-cols-3 gap-4">
        <Panel label="Mating Date" value={mating.mating_date} />
        <Panel label="Due Date" value={mating.estimated_due_date} />
        <Panel
          label="Phase"
          value={phase.toUpperCase()}
          highlight
        />
      </div>

      {/* CINEMATIC CORE */}
      <div className="border rounded-2xl p-10 text-center space-y-6 bg-gradient-to-b from-white to-gray-50">

        {phase === "pregnant" && (
          <>
            <div className="text-6xl">🤰</div>
            <h2 className="text-2xl font-semibold">
              Pregnancy confirmed
            </h2>
            <p className="text-gray-500">
              System is tracking fetal development...
            </p>

            <button
              onClick={startBirth}
              className="bg-black text-white px-6 py-3 rounded-full"
            >
              Trigger Birth Sequence
            </button>
          </>
        )}

        {phase === "birth" && (
          <>
            <div className="text-6xl animate-pulse">🐕‍🦺</div>
            <h2 className="text-2xl font-semibold">
              Birth in progress...
            </h2>
            <p className="text-gray-500">
              Generating litter...
            </p>
          </>
        )}

        {phase === "complete" && (
          <>
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-semibold">
              Litter successfully born
            </h2>

            <button
              onClick={commitToDatabase}
              className="bg-green-600 text-white px-6 py-3 rounded-full"
            >
              Save Litter to System
            </button>
          </>
        )}
      </div>

      {/* PUPPY PREVIEW GRID */}
      {puppies.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            🐾 Puppy Preview
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {puppies.map((p, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 text-center space-y-2 bg-white"
              >
                <div className="text-4xl">
                  {p.sex === "male" ? "♂️" : "♀️"}
                </div>

                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-500">
                  {p.color}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI COMPONENT ---------------- */

function Panel({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div
        className={`font-semibold ${
          highlight ? "text-indigo-600 text-lg" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
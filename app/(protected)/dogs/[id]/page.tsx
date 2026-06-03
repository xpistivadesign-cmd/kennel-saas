"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { addDays, differenceInDays, format } from "date-fns";

type Dog = any;
type Mating = any;
type Litter = any;

export default function DogProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [matings, setMatings] = useState<Mating[]>([]);
  const [litter, setLitter] = useState<Litter | null>(null);
  const [loading, setLoading] = useState(true);

  const [mateMaleId, setMateMaleId] = useState("");
  const [matingDate, setMatingDate] = useState("");

  useEffect(() => {
    load();
  }, [params.id]);

  async function load() {
    setLoading(true);

    // 🐶 DOG
    const { data: dogData, error: dogError } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (dogError) console.error(dogError);

    // ❤️ MATINGS
    const { data: matingData, error: matingError } = await supabase
      .from("matings")
      .select("*")
      .eq("female_id", params.id)
      .order("mating_date", { ascending: false });

    if (matingError) console.error(matingError);

    // 🐾 LITTERS (FIXED: no join on non-existing relation)
    const { data: litterData } = await supabase
      .from("litters")
      .select("*")
      .in(
        "mating_id",
        (matingData || []).map((m) => m.id)
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setDog(dogData);
    setMatings(matingData || []);
    setLitter(litterData || null);

    setLoading(false);
  }

  async function createMating() {
    if (!mateMaleId || !matingDate) return;

    const due = addDays(new Date(matingDate), 63);

    const { data, error } = await supabase
      .from("matings")
      .insert({
        female_id: params.id,
        male_id: mateMaleId,
        mating_date: matingDate,
        estimated_due_date: format(due, "yyyy-MM-dd"),
        method: "natural",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setMatings((prev) => [data, ...prev]);

    setMateMaleId("");
    setMatingDate("");
  }

  async function generateLitter(matingId: string) {
    const { data, error } = await supabase
      .from("litters")
      .insert({
        mating_id: matingId,
        birth_date: new Date().toISOString().split("T")[0],
        status: "born",
        male_count: 0,
        female_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setLitter(data);
  }

  const activeMating = matings[0];

  const daysLeft = useMemo(() => {
    if (!activeMating?.estimated_due_date) return null;

    return differenceInDays(
      new Date(activeMating.estimated_due_date),
      new Date()
    );
  }, [activeMating]);

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading kennel system...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{dog?.name}</h1>
          <p className="text-gray-500">
            {dog?.breed} • {dog?.sex}
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-semibold">{dog?.status}</div>
        </div>
      </div>

      {/* DASHBOARD */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          label="Last Mating"
          value={activeMating?.mating_date || "None"}
        />

        <Card
          label="Due Date"
          value={activeMating?.estimated_due_date || "—"}
        />

        <Card
          label="Countdown"
          value={
            daysLeft !== null ? `${daysLeft} days` : "—"
          }
          highlight
        />
      </div>

      {/* CREATE MATING */}
      <div className="p-6 border rounded-xl space-y-4">
        <h2 className="text-xl font-semibold">Create Mating</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Male Dog ID"
            value={mateMaleId}
            onChange={(e) => setMateMaleId(e.target.value)}
          />

          <input
            type="date"
            className="border p-2 rounded"
            value={matingDate}
            onChange={(e) => setMatingDate(e.target.value)}
          />
        </div>

        <button
          onClick={createMating}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Create Mating
        </button>
      </div>

      {/* MATINGS */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Matings</h2>

        {matings.length === 0 && (
          <p className="text-gray-500">No matings yet</p>
        )}

        {matings.map((m) => (
          <div
            key={m.id}
            className="p-4 border rounded-xl flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                {m.mating_date}
              </div>
              <div className="text-sm text-gray-500">
                Due: {m.estimated_due_date}
              </div>
            </div>

            <button
              onClick={() => generateLitter(m.id)}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Generate Litter
            </button>
          </div>
        ))}
      </div>

      {/* LITTER */}
      {litter && (
        <div className="p-6 border rounded-xl space-y-3 bg-gray-50">
          <h2 className="text-xl font-semibold">Litter</h2>

          <div className="grid grid-cols-3 gap-3">
            <Info label="Born" value={litter.birth_date} />
            <Info label="Male" value={litter.male_count} />
            <Info label="Female" value={litter.female_count} />
          </div>

          <button className="bg-indigo-600 text-white px-4 py-2 rounded">
            + Add Puppies
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

function Card({
  label,
  value,
  highlight,
}: {
  label: string;
  value: any;
  highlight?: boolean;
}) {
  return (
    <div className="p-4 border rounded-xl">
      <div className="text-sm text-gray-500">{label}</div>
      <div
        className={`text-lg font-semibold ${
          highlight ? "text-indigo-600 text-2xl" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
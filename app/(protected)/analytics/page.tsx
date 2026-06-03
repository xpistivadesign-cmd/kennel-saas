"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Dog = any;
type Mating = any;
type Litter = any;
type Puppy = any;
type Transaction = any;

export default function AnalyticsPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [matings, setMatings] = useState<Mating[]>([]);
  const [litters, setLitters] = useState<Litter[]>([]);
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contractTemplate, setContractTemplate] = useState<string>("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [
      { data: dogsData },
      { data: matingData },
      { data: litterData },
      { data: puppyData },
      { data: txData },
      { data: contractData },
    ] = await Promise.all([
      supabase.from("dogs").select("*"),
      supabase.from("matings").select("*"),
      supabase.from("litters").select("*"),
      supabase.from("puppies").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("kennel_contracts").select("*").maybeSingle(),
    ]);

    setDogs(dogsData || []);
    setMatings(matingData || []);
    setLitters(litterData || []);
    setPuppies(puppyData || []);
    setTransactions(txData || []);
    setContractTemplate(contractData?.contract_terms || "");

    setLoading(false);
  }

  /* ---------------- INTELLIGENCE ENGINE ---------------- */

  const insights = useMemo(() => {
    const soldPuppies = puppies.filter((p) => p.status === "sold");

    const revenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const profit = revenue - expenses;

    /* ---------------- TOP BREEDING PAIRS ---------------- */

    const pairMap: Record<string, { revenue: number; count: number }> =
      {};

    matings.forEach((m) => {
      const key = `${m.female_id}-${m.male_id}`;

      const litterIds = litters
        .filter((l) => l.mating_id === m.id)
        .map((l) => l.id);

      const puppyRevenue = soldPuppies
        .filter((p) => litterIds.includes(p.litter_id))
        .reduce((sum, p) => sum + (p.sale_price || 0), 0);

      if (!pairMap[key]) {
        pairMap[key] = { revenue: 0, count: 0 };
      }

      pairMap[key].revenue += puppyRevenue;
      pairMap[key].count += 1;
    });

    const topPairs = Object.entries(pairMap)
      .map(([key, value]) => ({
        pair: key,
        revenue: value.revenue,
        avg: value.count ? value.revenue / value.count : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    /* ---------------- DOG ROI ---------------- */

    const dogPerformance = dogs.map((d) => {
      const relatedLitters = matings
        .filter((m) => m.female_id === d.id)
        .flatMap((m) =>
          litters.filter((l) => l.mating_id === m.id)
        );

      const revenueFromDog = soldPuppies
        .filter((p) =>
          relatedLitters.some((l) => l.id === p.litter_id)
        )
        .reduce((sum, p) => sum + (p.sale_price || 0), 0);

      return {
        ...d,
        revenue: revenueFromDog,
      };
    });

    const topDogs = dogPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue,
      expenses,
      profit,
      topPairs,
      topDogs,
      soldCount: soldPuppies.length,
    };
  }, [dogs, matings, litters, puppies, transactions]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading enterprise analytics hub...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          📈 Enterprise Analytics & Legal Hub
        </h1>
        <p className="text-gray-500">
          Breeding intelligence + automated legal contracts
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">

        <KPI label="Revenue" value={insights.revenue} />
        <KPI label="Expenses" value={insights.expenses} />
        <KPI label="Profit" value={insights.profit} />
      </div>

      {/* TOP BREEDING PAIRS */}
      <div className="border rounded-xl p-5 space-y-4">

        <h2 className="text-xl font-semibold">
          🧬 Top Breeding Pairs (ROI Engine)
        </h2>

        {insights.topPairs.map((p, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-2"
          >
            <div className="text-sm text-gray-500">
              {p.pair}
            </div>

            <div className="font-semibold text-green-600">
              ${p.revenue.toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* TOP DOGS */}
      <div className="border rounded-xl p-5 space-y-4">

        <h2 className="text-xl font-semibold">
          🐶 Top Performing Dogs
        </h2>

        {insights.topDogs.map((d) => (
          <div
            key={d.id}
            className="flex justify-between border-b py-2"
          >
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-sm text-gray-500">
                {d.breed}
              </div>
            </div>

            <div className="font-bold text-indigo-600">
              ${d.revenue.toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* LEGAL CONTRACT SECTION */}
      <div className="border rounded-xl p-5 space-y-4">

        <h2 className="text-xl font-semibold">
          🧾 Contract Template (White-Label Legal Engine)
        </h2>

        <textarea
          className="w-full border p-3 rounded h-48 text-sm"
          value={contractTemplate}
          onChange={(e) => setContractTemplate(e.target.value)}
          placeholder="Contract template..."
        />

        <div className="flex gap-2">
          <button
            onClick={async () => {
              await supabase
                .from("kennel_contracts")
                .upsert({
                  user_id: (await supabase.auth.getUser()).data
                    .user?.id,
                  contract_terms: contractTemplate,
                });

              alert("Contract template saved");
            }}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Contract Template
          </button>

          <button className="border px-4 py-2 rounded">
            Preview PDF (next step)
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- KPI ---------------- */

function KPI({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-blue-600">
        ${value.toFixed(0)}
      </div>
    </div>
  );
}
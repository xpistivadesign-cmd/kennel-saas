"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Puppy = any;
type Transaction = any;

export default function FinancePage() {
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const [{ data: pupData }, { data: txData }] =
      await Promise.all([
        supabase
          .from("puppies")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

    setPuppies(pupData || []);
    setTransactions(txData || []);
    setLoading(false);
  }

  /* ---------------- KPI ENGINE ---------------- */

  const stats = useMemo(() => {
    const sold = puppies.filter((p) => p.status === "sold");
    const available = puppies.filter((p) => p.status === "available");

    const revenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const profit = revenue - expenses;

    const avgPrice =
      sold.length > 0
        ? revenue / sold.length
        : 0;

    const roi =
      expenses > 0 ? (profit / expenses) * 100 : 0;

    return {
      revenue,
      expenses,
      profit,
      sold: sold.length,
      available: available.length,
      avgPrice,
      roi,
    };
  }, [puppies, transactions]);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading financial intelligence hub...
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">
          💸 Financial & Marketplace Hub
        </h1>
        <p className="text-gray-500">
          Kennel revenue + public marketplace control center
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-4 gap-4">

        <KPI
          label="Revenue"
          value={`$${stats.revenue.toFixed(0)}`}
          tone="green"
        />

        <KPI
          label="Expenses"
          value={`$${stats.expenses.toFixed(0)}`}
          tone="red"
        />

        <KPI
          label="Profit"
          value={`$${stats.profit.toFixed(0)}`}
          tone={stats.profit >= 0 ? "green" : "red"}
        />

        <KPI
          label="ROI"
          value={`${stats.roi.toFixed(1)}%`}
          tone="blue"
        />
      </div>

      {/* MARKET STATUS */}
      <div className="grid grid-cols-3 gap-4">

        <Card
          title="🐾 Available Puppies"
          value={stats.available}
          subtitle="Live marketplace inventory"
        />

        <Card
          title="💰 Sold Puppies"
          value={stats.sold}
          subtitle="Revenue generating assets"
        />

        <Card
          title="📊 Avg Sale Price"
          value={`$${stats.avgPrice.toFixed(0)}`}
          subtitle="Market positioning metric"
        />
      </div>

      {/* MARKETPLACE PREVIEW */}
      <div className="border rounded-xl p-5 space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            🌐 Public Marketplace Preview
          </h2>

          <button className="px-4 py-2 bg-black text-white rounded">
            Open Public Storefront
          </button>
        </div>

        <p className="text-sm text-gray-500">
          These puppies are visible to buyers worldwide
        </p>

        <div className="grid grid-cols-3 gap-3">
          {puppies
            .filter((p) => p.status === "available")
            .slice(0, 6)
            .map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="text-lg font-semibold">
                  {p.name || "Unnamed Puppy"}
                </div>

                <div className="text-sm text-gray-500">
                  {p.color} • {p.sex}
                </div>

                <div className="font-bold text-indigo-600">
                  ${p.sale_price || 0}
                </div>

                <button className="w-full text-sm border rounded py-1">
                  View Listing
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* TRANSACTION FEED */}
      <div className="border rounded-xl p-5 space-y-3">

        <h2 className="text-xl font-semibold">
          📒 Recent Transactions
        </h2>

        {transactions.slice(0, 8).map((t) => (
          <div
            key={t.id}
            className="flex justify-between border-b py-2 text-sm"
          >
            <div>
              <div className="font-medium">
                {t.description || "Transaction"}
              </div>
              <div className="text-gray-500">
                {t.type}
              </div>
            </div>

            <div
              className={
                t.type === "income"
                  ? "text-green-600 font-semibold"
                  : "text-red-600 font-semibold"
              }
            >
              {t.type === "income" ? "+" : "-"}${t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KPI({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "blue";
}) {
  const color =
    tone === "green"
      ? "text-green-600"
      : tone === "red"
      ? "text-red-600"
      : "text-blue-600";

  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: any;
  subtitle: string;
}) {
  return (
    <div className="border rounded-xl p-4 space-y-1">
      <div className="font-semibold">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">
        {subtitle}
      </div>
    </div>
  );
}
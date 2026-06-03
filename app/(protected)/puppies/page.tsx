"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Puppy = any;

export default function PuppyDashboard() {
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] =
    useState<"all" | "available" | "reserved" | "sold">("all");

  const [selected, setSelected] = useState<Puppy | null>(null);
  const [salePrice, setSalePrice] = useState("");
  const [buyerName, setBuyerName] = useState("");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    await getUser();
    await load();
  }

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id || null);
  }

  async function load() {
    setLoading(true);

    const { data } = await supabase
      .from("puppies")
      .select("*")
      .order("created_at", { ascending: false });

    setPuppies(data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    if (filter === "all") return puppies;
    return puppies.filter((p) => p.status === filter);
  }, [puppies, filter]);

  async function updateStatus(id: string, status: string) {
    const { data } = await supabase
      .from("puppies")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    setPuppies((prev) =>
      prev.map((p) => (p.id === id ? data : p))
    );
  }

  async function markSold(puppy: Puppy) {
    if (!salePrice) return;

    // 1. BUYER (RLS FIX: user_id included)
    const { data: buyer, error: buyerError } = await supabase
      .from("buyers")
      .insert({
        name: buyerName || "Unknown Buyer",
        created_by: userId, // 🔥 FIX
      })
      .select()
      .single();

    if (buyerError) {
      console.error("Buyer error:", buyerError);
      return;
    }

    // 2. PUPPY UPDATE
    const { data: updated, error: puppyError } = await supabase
      .from("puppies")
      .update({
        status: "sold",
        sale_price: Number(salePrice),
        buyer_id: buyer.id,
      })
      .eq("id", puppy.id)
      .select()
      .single();

    if (puppyError) {
      console.error("Puppy update error:", puppyError);
      return;
    }

    // 3. TRANSACTION AUTO (ERP LOGIKA)
    await supabase.from("transactions").insert({
      type: "income",
      amount: Number(salePrice),
      category: "puppy_sale",
      puppy_id: puppy.id,
      created_by: userId, // 🔥 FIX
    });

    setPuppies((prev) =>
      prev.map((p) => (p.id === puppy.id ? updated : p))
    );

    setSelected(null);
    setSalePrice("");
    setBuyerName("");
  }

  const stats = useMemo(() => {
    return {
      total: puppies.length,
      available: puppies.filter((p) => p.status === "available").length,
      reserved: puppies.filter((p) => p.status === "reserved").length,
      sold: puppies.filter((p) => p.status === "sold").length,
      revenue: puppies
        .filter((p) => p.status === "sold")
        .reduce((sum, p) => sum + (p.sale_price || 0), 0),
    };
  }, [puppies]);

  if (loading) {
    return (
      <div className="p-10 text-gray-500">
        Loading Puppy OS...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Puppy Management</h1>
          <p className="text-gray-500">
            Breeding Lifecycle Control Center
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            €{stats.revenue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Available" value={stats.available} />
        <Stat label="Reserved" value={stats.reserved} />
        <Stat label="Sold" value={stats.sold} />
      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {["all", "available", "reserved", "sold"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded-full border ${
              filter === f ? "bg-black text-white" : ""
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="border rounded-xl p-4 space-y-2 hover:shadow-lg transition"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-bold">
                  {p.name || "Unnamed Puppy"}
                </div>
                <div className="text-xs text-gray-500">
                  {p.sex} • {p.color || "unknown"}
                </div>
              </div>

              <StatusBadge status={p.status} />
            </div>

            <div className="text-sm text-gray-500">
              Born order: {p.birth_order || "-"}
            </div>

            <div className="text-sm">
              Chip: {p.chip_number || "—"}
            </div>

            <div className="flex gap-2 pt-2">
              {p.status !== "sold" && (
                <>
                  <button
                    onClick={() => updateStatus(p.id, "reserved")}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Reserve
                  </button>

                  <button
                    onClick={() => updateStatus(p.id, "available")}
                    className="text-xs px-2 py-1 border rounded"
                  >
                    Available
                  </button>

                  <button
                    onClick={() => setSelected(p)}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded"
                  >
                    Sell
                  </button>
                </>
              )}
            </div>

            {p.status === "sold" && (
              <div className="text-green-600 font-semibold">
                Sold: €{p.sale_price}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-xl font-bold">
              Sell Puppy: {selected.name || "Unnamed"}
            </h2>

            <input
              className="border w-full p-2 rounded"
              placeholder="Buyer name"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />

            <input
              className="border w-full p-2 rounded"
              placeholder="Sale price"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelected(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => markSold(selected)}
                className="px-3 py-1 bg-black text-white rounded"
              >
                Confirm Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* UI COMPONENTS */

function Stat({ label, value }: any) {
  return (
    <div className="border rounded-xl p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "available"
      ? "bg-blue-100 text-blue-700"
      : status === "reserved"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
      {status}
    </span>
  );
}
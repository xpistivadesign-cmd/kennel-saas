"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Dog = {
  id: string;
  name: string;
  sex: string | null;
  is_public: boolean;
  is_for_sale: boolean;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  dog_id: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // LOAD USER + DATA
  // -------------------------
  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      router.push("/");
      return;
    }

    setUserId(user.id);

    // DOGS
    const { data: dogsData } = await supabase
      .from("dogs")
      .select("id, name, sex, is_public, is_for_sale")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setDogs(dogsData || []);

    // LEADS (join via dogs)
    const { data: leadsData } = await supabase
      .from("dog_leads")
      .select("id, name, email, dog_id, created_at")
      .order("created_at", { ascending: false });

    setLeads(leadsData || []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // -------------------------
  // TOGGLES
  // -------------------------
  async function togglePublic(dog: Dog) {
    await supabase
      .from("dogs")
      .update({ is_public: !dog.is_public })
      .eq("id", dog.id);

    load();
  }

  async function toggleForSale(dog: Dog) {
    await supabase
      .from("dogs")
      .update({ is_for_sale: !dog.is_for_sale })
      .eq("id", dog.id);

    load();
  }

  function copyLink(dogId: string) {
    const link = `${window.location.origin}/public/dogs/${dogId}`;
    navigator.clipboard.writeText(link);
    alert("Public link copied!");
  }

  // -------------------------
  // UI
  // -------------------------
  if (loading) {
    return (
      <div style={center}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={wrap}>
      {/* HEADER */}
      <div style={header}>
        <h1>🐶 Kennel Dashboard</h1>

        <button
          onClick={() => router.push("/dogs/new")}
          style={btnPrimary}
        >
          + Add Dog
        </button>
      </div>

      {/* STATS */}
      <div style={stats}>
        <div style={card}>
          <h3>{dogs.length}</h3>
          <p>Dogs</p>
        </div>

        <div style={card}>
          <h3>{dogs.filter(d => d.is_for_sale).length}</h3>
          <p>For Sale</p>
        </div>

        <div style={card}>
          <h3>{leads.length}</h3>
          <p>Leads</p>
        </div>
      </div>

      {/* DOG LIST */}
      <h2 style={{ marginTop: 30 }}>🐶 Your Dogs</h2>

      <div style={grid}>
        {dogs.map((dog) => (
          <div key={dog.id} style={dogCard}>
            <h3 style={{ margin: 0 }}>{dog.name}</h3>

            <p style={{ color: "#666" }}>
              {dog.sex || "Unknown"}
            </p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={badge(dog.is_public)}>
                {dog.is_public ? "Public" : "Private"}
              </span>

              <span style={badge(dog.is_for_sale)}>
                {dog.is_for_sale ? "For Sale" : "Not For Sale"}
              </span>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => router.push(`/dogs/${dog.id}`)} style={btn}>
                Open
              </button>

              <button onClick={() => togglePublic(dog)} style={btnSmall}>
                Toggle Public
              </button>

              <button onClick={() => toggleForSale(dog)} style={btnSmall}>
                Toggle Sale
              </button>

              <button onClick={() => copyLink(dog.id)} style={btnSmall}>
                Copy Link
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LEADS */}
      <h2 style={{ marginTop: 40 }}>📥 Recent Leads</h2>

      <div style={leadBox}>
        {leads.length === 0 ? (
          <p style={{ color: "#999" }}>No leads yet</p>
        ) : (
          leads.slice(0, 10).map((lead) => (
            <div key={lead.id} style={leadItem}>
              <div>
                <strong>{lead.name}</strong>
                <p style={{ margin: 0, color: "#666" }}>{lead.email}</p>
              </div>

              <small style={{ color: "#999" }}>
                {new Date(lead.created_at).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 1000,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const stats: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,
  marginTop: 20,
};

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
  textAlign: "center",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  gap: 12,
};

const dogCard: React.CSSProperties = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
};

const btn: React.CSSProperties = {
  padding: "6px 10px",
  background: "#111",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

const btnSmall: React.CSSProperties = {
  padding: "6px 8px",
  background: "#f0f0f0",
  border: "1px solid #ddd",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
};

function badge(active: boolean): React.CSSProperties {
  return {
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 11,
    background: active ? "#d1fae5" : "#f3f4f6",
    color: "#111",
  };
}

const leadBox: React.CSSProperties = {
  marginTop: 10,
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 12,
};

const leadItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: "1px solid #f3f3f3",
};

const center: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};
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
  message: string;
  created_at: string;
  dogs: { name: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // -----------------------
      // DOGS (secure by user_id)
      // -----------------------
      const { data: dogsData, error: dogsError } = await supabase
        .from("dogs")
        .select("id, name, sex, is_public, is_for_sale")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (dogsError) throw dogsError;

      setDogs(dogsData || []);

      // -----------------------
      // LEADS (FIXED SECURITY)
      // -----------------------
      const { data: leadsData, error: leadsError } = await supabase
        .from("dog_leads")
        .select(`
          id,
          name,
          email,
          message,
          created_at,
          dogs!inner ( name, user_id )
        `)
        .eq("dogs.user_id", user.id)
        .order("created_at", { ascending: false });

      if (leadsError) throw leadsError;

      setLeads((leadsData as any) || []);
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  // -----------------------
  // SAFE SHARE LINK
  // -----------------------
  const copyShareLink = (dogId: string, isPublic: boolean) => {
    if (!isPublic) {
      alert("Dog is private. Make it public first.");
      return;
    }

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const publicUrl = `${origin}/public/dogs/${dogId}`;

    navigator.clipboard.writeText(publicUrl);
    setCopiedId(dogId);

    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
        Loading secure dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif", color: "red" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: 0 }}>🇺🇸 Breeder Command Center</h1>
          <p style={{ color: "#666", margin: "4px 0 0 0" }}>
            Manage your kennel, photos, and live inquiries.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => router.push("/calendar")}
            style={{
              padding: "12px 20px",
              background: "#fff",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            📅 Open Kennel Calendar
          </button>

          <button
            onClick={() => router.push("/dogs/new")}
            style={{
              padding: "12px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ➕ Register New Dog
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        <div style={statCard}>
          <h3>Total Dogs</h3>
          <p style={statNumber}>{dogs.length}</p>
        </div>

        <div style={statCard}>
          <h3>Public on Web</h3>
          <p style={statNumber}>{dogs.filter((d) => d.is_public).length}</p>
        </div>

        <div style={statCard}>
          <h3>Active Leads</h3>
          <p style={statNumber}>{leads.length}</p>
        </div>
      </div>

      {/* DOGS TABLE */}
      <div style={sectionCard}>
        <h2 style={{ marginTop: 0 }}>🐕 Your Dogs</h2>

        {dogs.length === 0 ? (
          <p style={{ color: "#999" }}>No dogs yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                <th style={{ padding: 10 }}>Name</th>
                <th style={{ padding: 10 }}>Gender</th>
                <th style={{ padding: 10 }}>Status</th>
                <th style={{ padding: 10, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {dogs.map((dog) => (
                <tr key={dog.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td
                    style={{ padding: 10, color: "#0070f3", cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => router.push(`/dogs/${dog.id}`)}
                  >
                    {dog.name}
                  </td>

                  <td style={{ padding: 10 }}>
                    {dog.sex === "female" ? "Female" : "Male"}
                  </td>

                  <td style={{ padding: 10 }}>
                    {dog.is_public ? "🌍 Public" : "🔒 Private"}
                  </td>

                  <td style={{ padding: 10, textAlign: "right" }}>
                    <button
                      onClick={() => copyShareLink(dog.id, dog.is_public)}
                      style={{
                        padding: "6px 10px",
                        marginRight: 8,
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {copiedId === dog.id ? "Copied!" : "Share"}
                    </button>

                    <button
                      onClick={() => router.push(`/dogs/${dog.id}`)}
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #ccc",
                        borderRadius: 6,
                        background: "#f5f5f5",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* LEADS */}
      <div style={sectionCard}>
        <h2 style={{ marginTop: 0 }}>📥 Leads</h2>

        {leads.length === 0 ? (
          <p style={{ color: "#999" }}>No leads yet.</p>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              style={{
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <strong>
                {lead.name} ({lead.email})
              </strong>

              <div style={{ fontSize: 12, color: "#666" }}>
                Dog: {lead.dogs?.name || "Unknown"}
              </div>

              <p style={{ marginTop: 8 }}>{lead.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------- UI ----------------

const statCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 20,
};

const statNumber: React.CSSProperties = {
  fontSize: 28,
  fontWeight: "bold",
  color: "#0070f3",
};

const sectionCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};
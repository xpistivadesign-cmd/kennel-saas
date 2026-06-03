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

type Event = {
  id: string;
  dog_id: string;
  title: string;
  type: string;
  reminder_date: string | null;
  created_at: string;
  dogs: { name: string };
};

export default function DashboardPage() {
  const router = useRouter();

  const [dogs, setDogs] = useState<Dog[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // ---------------- DOGS ----------------
      const { data: dogsData, error: dogsError } = await supabase
        .from("dogs")
        .select("id, name, sex, is_public, is_for_sale")
        .eq("user_id", user.id)
        .order("name");

      if (dogsError) throw dogsError;
      setDogs(dogsData || []);

      // ---------------- LEADS (SECURE) ----------------
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

      // ---------------- EVENTS ----------------
      const { data: eventsData, error: eventsError } = await supabase
        .from("dog_events")
        .select(`
          id,
          dog_id,
          title,
          type,
          reminder_date,
          created_at,
          dogs!inner ( name, user_id )
        `)
        .eq("dogs.user_id", user.id)
        .order("reminder_date", { ascending: true });

      if (eventsError) throw eventsError;
      setEvents((eventsData as any) || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Dashboard error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ---------------- HELPERS ----------------
  const isDueSoon = (date: string | null) => {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff < 3 * 24 * 60 * 60 * 1000 && diff > 0;
  };

  const isOverdue = (date: string | null) => {
    if (!date) return false;
    return new Date(date).getTime() < Date.now();
  };

  const copyShareLink = (dogId: string, isPublic: boolean) => {
    if (!isPublic) {
      alert("Dog is private. Make it public first.");
      return;
    }

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";

    const url = `${origin}/public/dogs/${dogId}`;
    navigator.clipboard.writeText(url);

    setCopiedId(dogId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const todayTasks = events.filter(
    (e) => isDueSoon(e.reminder_date) || isOverdue(e.reminder_date)
  );

  // ---------------- UI STATES ----------------
  if (loading) {
    return <div style={{ padding: 40 }}>Loading kennel system...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 40, color: "red", fontFamily: "sans-serif" }}>
        {error}
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <div>
          <h1>🇺🇸 Kennel Command Center</h1>
          <p style={{ color: "#666" }}>Operations dashboard for breeders</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.push("/calendar")} style={btnSecondary}>
            📅 Calendar
          </button>
          <button onClick={() => router.push("/dogs/new")} style={btnPrimary}>
            ➕ New Dog
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={grid}>
        <div style={card}>
          <h3>Dogs</h3>
          <b style={big}>{dogs.length}</b>
        </div>

        <div style={card}>
          <h3>Public Dogs</h3>
          <b style={big}>{dogs.filter(d => d.is_public).length}</b>
        </div>

        <div style={card}>
          <h3>Leads</h3>
          <b style={big}>{leads.length}</b>
        </div>
      </div>

      {/* TODAY TASKS */}
      <div style={section}>
        <h2>⚠️ Today Tasks</h2>

        {todayTasks.length === 0 ? (
          <p style={{ color: "#999" }}>No urgent tasks 🎉</p>
        ) : (
          todayTasks.map((t) => (
            <div key={t.id} style={taskCard(t.reminder_date)}>
              <b>{t.title}</b>
              <div style={{ fontSize: 12, color: "#666" }}>
                {t.dogs.name} • {t.type}
              </div>

              {isOverdue(t.reminder_date) && (
                <span style={badgeRed}>OVERDUE</span>
              )}

              {isDueSoon(t.reminder_date) && !isOverdue(t.reminder_date) && (
                <span style={badgeYellow}>DUE SOON</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* DOGS */}
      <div style={section}>
        <h2>🐶 Dogs</h2>

        {dogs.map((d) => (
          <div key={d.id} style={row}>
            <b>{d.name}</b>
            <span>{d.sex}</span>
            <span>{d.is_public ? "Public" : "Private"}</span>

            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => copyShareLink(d.id, d.is_public)} style={smallBtn}>
                {copiedId === d.id ? "Copied" : "Share"}
              </button>

              <button onClick={() => router.push(`/dogs/${d.id}`)} style={smallBtn}>
                Open
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* LEADS */}
      <div style={section}>
        <h2>📥 Leads</h2>

        {leads.map((l) => (
          <div key={l.id} style={leadCard}>
            <b>{l.name}</b> ({l.email})
            <div style={{ fontSize: 12 }}>Dog: {l.dogs?.name}</div>
            <p>{l.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: 12,
  marginBottom: 20,
} as const;

const card = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
} as const;

const section = {
  marginTop: 30,
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
} as const;

const row = {
  display: "flex",
  gap: 10,
  padding: 10,
  borderBottom: "1px solid #eee",
  alignItems: "center",
} as const;

const leadCard = {
  padding: 10,
  border: "1px solid #eee",
  borderRadius: 8,
  marginBottom: 10,
} as const;

const taskCard = (date: string | null) => ({
  padding: 10,
  border: "1px solid #eee",
  borderRadius: 8,
  marginBottom: 10,
  background:
    date && new Date(date).getTime() < Date.now() ? "#fff5f5" : "#fff",
}) as const;

const big = {
  fontSize: 26,
  color: "#0070f3",
} as const;

const badgeRed = {
  background: "#ff4d4f",
  color: "white",
  padding: "2px 6px",
  borderRadius: 6,
  fontSize: 11,
  marginLeft: 8,
} as const;

const badgeYellow = {
  background: "#faad14",
  color: "white",
  padding: "2px 6px",
  borderRadius: 6,
  fontSize: 11,
  marginLeft: 8,
} as const;

const btnPrimary = {
  padding: "10px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
} as const;

const btnSecondary = {
  padding: "10px 14px",
  background: "white",
  border: "1px solid #ccc",
  borderRadius: 8,
} as const;

const smallBtn = {
  marginLeft: 6,
  padding: "4px 8px",
  border: "1px solid #ccc",
  borderRadius: 6,
  background: "white",
} as const;
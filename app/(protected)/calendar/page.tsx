"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Event = {
  id: string;
  dog_id: string;
  title: string;
  type: string;
  created_at: string;
  reminder_date: string | null;
};

export default function CalendarPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // LOAD EVENTS
  // -------------------------
  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      router.push("/");
      return;
    }

    // join dogs → ensure ownership security
    const { data } = await supabase
      .from("dog_events")
      .select(`
        id,
        dog_id,
        title,
        type,
        created_at,
        reminder_date,
        dogs!inner(user_id)
      `)
      .eq("dogs.user_id", user.id)
      .order("created_at", { ascending: false });

    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // -------------------------
  // HELPERS
  // -------------------------
  function isDueSoon(date: string | null) {
    if (!date) return false;

    const now = new Date();
    const d = new Date(date);

    const diff = d.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    return days <= 3 && days >= 0;
  }

  function isOverdue(date: string | null) {
    if (!date) return false;
    return new Date(date).getTime() < Date.now();
  }

  if (loading) {
    return <div style={wrap}>Loading calendar...</div>;
  }

  return (
    <div style={wrap}>
      <h1>📅 Kennel Calendar</h1>

      <p style={{ color: "#666" }}>
        Vaccinations, health checks, reminders
      </p>

      {/* EVENTS */}
      <div style={grid}>
        {events.length === 0 ? (
          <p>No events scheduled</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} style={card(ev.reminder_date)}>
              <div style={{ fontWeight: "bold" }}>
                {ev.title}
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                {ev.type}
              </div>

              <div style={{ fontSize: 12, marginTop: 6 }}>
                {new Date(ev.created_at).toLocaleDateString()}
              </div>

              {ev.reminder_date && (
                <div style={{ marginTop: 8 }}>
                  {isOverdue(ev.reminder_date) && (
                    <span style={badgeRed}>OVERDUE</span>
                  )}

                  {isDueSoon(ev.reminder_date) && !isOverdue(ev.reminder_date) && (
                    <span style={badgeYellow}>DUE SOON</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 1000,
  margin: "40px auto",
  fontFamily: "sans-serif",
  padding: 20,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 12,
  marginTop: 20,
};

const card = (reminder: string | null): React.CSSProperties => {
  const now = new Date().getTime();
  const due = reminder ? new Date(reminder).getTime() : null;

  return {
    padding: 16,
    borderRadius: 12,
    border: "1px solid #eee",
    background:
      due && due < now ? "#fff5f5" : "#fff",
  };
};

const badgeRed: React.CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 11,
};

const badgeYellow: React.CSSProperties = {
  background: "#fef9c3",
  color: "#92400e",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 11,
};
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

type Event = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
};

export default function DogProfilePage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    type: "note",
    title: "",
    description: "",
  });

  // -------------------------
  // LOAD DOG + EVENTS
  // -------------------------
  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user || !dogId) return;

    const { data: dogData } = await supabase
      .from("dogs")
      .select("*")
      .eq("id", dogId)
      .eq("user_id", user.id)
      .single();

    setDog(dogData);

    const { data: eventsData } = await supabase
      .from("dog_events")
      .select("*")
      .eq("dog_id", dogId)
      .order("created_at", { ascending: false });

    setEvents(eventsData || []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [dogId]);

  // -------------------------
  // ADD EVENT
  // -------------------------
  async function addEvent() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) return;

    await supabase.from("dog_events").insert({
      dog_id: dogId,
      user_id: user.id,
      type: newEvent.type,
      title: newEvent.title,
      description: newEvent.description,
    });

    setNewEvent({ type: "note", title: "", description: "" });
    load();
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={wrap}>
      <h1>🐶 {dog?.name} – Timeline</h1>

      {/* ADD EVENT */}
      <div style={card}>
        <h3>Add Event</h3>

        <select
          value={newEvent.type}
          onChange={(e) =>
            setNewEvent({ ...newEvent, type: e.target.value })
          }
          style={input}
        >
          <option value="note">Note</option>
          <option value="vaccination">Vaccination</option>
          <option value="health">Health</option>
          <option value="status_change">Status change</option>
        </select>

        <input
          placeholder="Title"
          value={newEvent.title}
          onChange={(e) =>
            setNewEvent({ ...newEvent, title: e.target.value })
          }
          style={input}
        />

        <textarea
          placeholder="Description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
          style={input}
        />

        <button onClick={addEvent} style={btn}>
          Add Event
        </button>
      </div>

      {/* TIMELINE */}
      <h3 style={{ marginTop: 30 }}>📜 History</h3>

      <div>
        {events.length === 0 ? (
          <p style={{ color: "#999" }}>No events yet</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} style={eventCard}>
              <div style={{ fontWeight: "bold" }}>
                {ev.title}
              </div>

              <div style={{ fontSize: 12, color: "#666" }}>
                {ev.type} •{" "}
                {new Date(ev.created_at).toLocaleString()}
              </div>

              {ev.description && (
                <p style={{ marginTop: 6 }}>{ev.description}</p>
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
  maxWidth: 800,
  margin: "40px auto",
  fontFamily: "sans-serif",
};

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  marginTop: 10,
  padding: "10px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
};

const eventCard: React.CSSProperties = {
  padding: 12,
  borderBottom: "1px solid #eee",
};
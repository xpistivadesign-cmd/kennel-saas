"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Event = {
  id: string;
  title: string;
  type: string;
  reminder_date: string | null;
  created_at: string;
  dog_id: string;
  dogs: { name: string };
};

export default function CalendarPage() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("vaccination");
  const [date, setDate] = useState("");
  const [dogId, setDogId] = useState("");

  const [dogs, setDogs] = useState<{ id: string; name: string }[]>([]);

  async function load() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    // dogs
    const { data: dogsData } = await supabase
      .from("dogs")
      .select("id, name")
      .eq("user_id", user.id);

    setDogs(dogsData || []);

    // events
    const { data: eventsData } = await supabase
      .from("dog_events")
      .select(`
        id,
        title,
        type,
        reminder_date,
        created_at,
        dog_id,
        dogs!inner ( name, user_id )
      `)
      .eq("dogs.user_id", user.id)
      .order("reminder_date", { ascending: true });

    setEvents((eventsData as any) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createEvent() {
    if (!title || !dogId) return alert("Missing fields");

    const { error } = await supabase.from("dog_events").insert({
      title,
      type,
      reminder_date: date || null,
      dog_id: dogId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTitle("");
    setDate("");
    setDogId("");

    await load();
  }

  const today = new Date();

  const upcoming = events.filter((e) => {
    if (!e.reminder_date) return false;
    return new Date(e.reminder_date).getTime() >= today.getTime();
  });

  const past = events.filter((e) => {
    if (!e.reminder_date) return false;
    return new Date(e.reminder_date).getTime() < today.getTime();
  });

  if (loading) {
    return <div style={{ padding: 40 }}>Loading calendar...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      
      <button onClick={() => router.push("/")} style={btn}>
        ← Back
      </button>

      <h1>📅 Kennel Calendar</h1>
      <p style={{ color: "#666" }}>Manage all breeding events, vaccinations and reminders</p>

      {/* CREATE EVENT */}
      <div style={card}>
        <h3>➕ New Event</h3>

        <input
          placeholder="Title (e.g. Vaccination)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={input}
        />

        <select value={type} onChange={(e) => setType(e.target.value)} style={input}>
          <option value="vaccination">Vaccination</option>
          <option value="breeding">Breeding</option>
          <option value="vet">Vet Visit</option>
          <option value="reminder">Reminder</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={input}
        />

        <select value={dogId} onChange={(e) => setDogId(e.target.value)} style={input}>
          <option value="">Select dog</option>
          {dogs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <button onClick={createEvent} style={primaryBtn}>
          Save Event
        </button>
      </div>

      {/* UPCOMING */}
      <h2>🟢 Upcoming</h2>
      {upcoming.length === 0 ? (
        <p style={{ color: "#999" }}>No upcoming events</p>
      ) : (
        upcoming.map((e) => (
          <div key={e.id} style={eventCard}>
            <b>{e.title}</b>
            <div style={{ fontSize: 12, color: "#666" }}>
              {e.dogs.name} • {e.type}
            </div>
            <div>{e.reminder_date}</div>
          </div>
        ))
      )}

      {/* PAST */}
      <h2 style={{ marginTop: 30 }}>⚪ Past</h2>
      {past.map((e) => (
        <div key={e.id} style={{ ...eventCard, opacity: 0.6 }}>
          <b>{e.title}</b>
          <div style={{ fontSize: 12 }}>{e.dogs.name}</div>
          <div>{e.reminder_date}</div>
        </div>
      ))}
    </div>
  );
}

const card = {
  padding: 16,
  border: "1px solid #eee",
  borderRadius: 12,
  marginBottom: 20,
};

const eventCard = {
  padding: 12,
  border: "1px solid #eee",
  borderRadius: 10,
  marginBottom: 10,
};

const input = {
  display: "block",
  width: "100%",
  marginBottom: 10,
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 8,
};

const btn = {
  marginBottom: 20,
  padding: "8px 12px",
  border: "1px solid #ccc",
  background: "white",
  borderRadius: 8,
};

const primaryBtn = {
  padding: "10px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
};
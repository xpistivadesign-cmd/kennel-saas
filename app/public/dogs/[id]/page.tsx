"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Photo = {
  id: string;
  image_url: string;
};

type Dog = {
  id: string;
  name: string;
  sex?: string | null;
};

export default function PublicDogProfile() {
  const params = useParams();
  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<Dog | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    has_yard: false,
  });

  const [submitted, setSubmitted] = useState(false);

  // -------------------------
  // LOAD PUBLIC DATA
  // -------------------------
  async function load() {
    if (!dogId) return;

    setLoading(true);

    try {
      const { data: dogData } = await supabase
        .from("dogs")
        .select("id, name, sex")
        .eq("id", dogId)
        .single();

      if (dogData) setDog(dogData);

      const { data: photoData } = await supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false });

      setPhotos(photoData || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [dogId]);

  // -------------------------
  // SUBMIT LEAD
  // -------------------------
  async function submitLead() {
    if (!dogId) return;

    if (!form.name || !form.email) {
      alert("Please fill name and email");
      return;
    }

    const { error } = await supabase.from("dog_leads").insert({
      dog_id: dogId,
      name: form.name,
      email: form.email,
      message: form.message,
      has_yard: form.has_yard,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSubmitted(true);
    setForm({
      name: "",
      email: "",
      message: "",
      has_yard: false,
    });
  }

  // -------------------------
  // UI STATES
  // -------------------------
  if (loading) {
    return (
      <div style={center}>
        Loading public profile...
      </div>
    );
  }

  if (!dog) {
    return (
      <div style={center}>
        <h2>🐶 Dog not found</h2>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={wrap}>
      {/* HEADER */}
      <div style={header}>
        <h1>🐶 {dog.name}</h1>

        <p style={{ color: "#666" }}>
          {dog.sex === "female"
            ? "Female"
            : dog.sex === "male"
            ? "Male"
            : "Unknown"}
        </p>
      </div>

      {/* HERO */}
      <div style={hero}>
        <h2>Meet {dog.name}</h2>
        <p>Official breeder profile page</p>
      </div>

      {/* GALLERY */}
      <h3 style={{ marginTop: 30 }}>📸 Gallery</h3>

      {photos.length === 0 ? (
        <p style={{ color: "#999" }}>No photos yet</p>
      ) : (
        <div style={grid}>
          {photos.map((p) => (
            <img key={p.id} src={p.image_url} style={img} />
          ))}
        </div>
      )}

      {/* LEAD FORM */}
      <div style={card}>
        <h3>🐾 Interested in {dog.name}?</h3>

        {submitted ? (
          <p style={{ color: "green" }}>
            ✔ Inquiry sent! The breeder will contact you soon.
          </p>
        ) : (
          <>
            <input
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              style={input}
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              style={input}
            />

            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              style={input}
            />

            <label style={{ display: "block", marginTop: 10 }}>
              <input
                type="checkbox"
                checked={form.has_yard}
                onChange={(e) =>
                  setForm({
                    ...form,
                    has_yard: e.target.checked,
                  })
                }
              />
              I have a yard
            </label>

            <button onClick={submitLead} style={btn}>
              Send Inquiry
            </button>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div style={footer}>
        Share this page with others 💌
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 900,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const hero: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  background: "#f6f8fa",
  borderRadius: 12,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 10,
};

const img: React.CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 10,
};

const card: React.CSSProperties = {
  marginTop: 30,
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
  cursor: "pointer",
};

const footer: React.CSSProperties = {
  marginTop: 40,
  textAlign: "center",
  color: "#777",
};

const center: React.CSSProperties = {
  padding: 40,
  textAlign: "center",
};
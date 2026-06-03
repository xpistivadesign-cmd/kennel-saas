"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Dog = {
  id: string;
  name: string;
  sex: string | null;
  breed: string | null;
  is_public: boolean;
  description: string | null;
};

type Photo = {
  id: string;
  image_url: string;
};

export default function PublicDogProfilePage() {
  const params = useParams();
  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dog, setDog] = useState<Dog | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // LEAD FORM
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function load() {
    if (!dogId) return;

    setLoading(true);

    try {
      // 1. Dog lekérés
      const { data: dogData } = await supabase
        .from("dogs")
        .select("id, name, sex, breed, is_public, description")
        .eq("id", dogId)
        .single();

      if (!dogData) {
        setNotFound(true);
        return;
      }

      // 2. PUBLIC CHECK (EZ A KRITIKUS BIZTONSÁG)
      if (!dogData.is_public) {
        setNotFound(true);
        return;
      }

      setDog(dogData);

      // 3. Photos
      const { data: photoData } = await supabase
        .from("dog_photos")
        .select("id, image_url")
        .eq("dog_id", dogId)
        .order("created_at", { ascending: false });

      setPhotos(photoData || []);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [dogId]);

  async function submitLead() {
    if (!dog) return;

    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("dog_leads").insert({
      dog_id: dog.id,
      name,
      email,
      message,
    });

    setSending(false);

    if (error) {
      alert("Error sending message");
      return;
    }

    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  if (loading) {
    return (
      <div style={center}>
        Loading kennel profile...
      </div>
    );
  }

  if (notFound || !dog) {
    return (
      <div style={center}>
        <h2>🐶 Dog not available</h2>
        <p>This profile is private or does not exist.</p>
      </div>
    );
  }

  return (
    <div style={container}>

      {/* HEADER */}
      <h1 style={{ fontSize: 32, marginBottom: 4 }}>
        🐶 {dog.name}
      </h1>

      <p style={{ color: "#666" }}>
        {dog.breed || "Unknown breed"} •{" "}
        {dog.sex === "female" ? "Female" : "Male"}
      </p>

      {dog.description && (
        <p style={{ marginTop: 10, color: "#444" }}>
          {dog.description}
        </p>
      )}

      {/* PHOTOS */}
      <h2 style={{ marginTop: 30 }}>📸 Photos</h2>

      {photos.length === 0 ? (
        <p style={{ color: "#999" }}>No photos available</p>
      ) : (
        <div style={grid}>
          {photos.map((p) => (
            <img
              key={p.id}
              src={p.image_url}
              style={img}
              alt="dog"
            />
          ))}
        </div>
      )}

      {/* LEAD FORM */}
      <div style={formBox}>
        <h2>💬 Inquire about this puppy</h2>

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={input}
        />

        <input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <textarea
          placeholder="Your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={textarea}
        />

        <button
          onClick={submitLead}
          disabled={sending}
          style={button}
        >
          {sending ? "Sending..." : "Send Inquiry"}
        </button>

        {sent && (
          <p style={{ color: "green", marginTop: 10 }}>
            ✅ Message sent! The breeder will contact you soon.
          </p>
        )}
      </div>
    </div>
  );
}

/* STYLES */

const container = {
  maxWidth: 800,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const center = {
  textAlign: "center",
  marginTop: 80,
  fontFamily: "sans-serif",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 10,
  marginTop: 10,
};

const img = {
  width: "100%",
  height: 160,
  objectFit: "cover",
  borderRadius: 10,
};

const formBox = {
  marginTop: 40,
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fafafa",
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const textarea = {
  width: "100%",
  padding: 10,
  height: 100,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const button = {
  padding: "10px 14px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
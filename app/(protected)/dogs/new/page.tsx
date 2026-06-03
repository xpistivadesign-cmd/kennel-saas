"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NewDogPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sex: "",
    breed: "",
    birth_date: "",
    reg_number: "",
    microchip_id: "",
    color_markings: "",
    notes: "",
  });

  // -------------------------
  // CREATE DOG
  // -------------------------
  async function createDog() {
    if (!form.name) {
      alert("Name is required");
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const user = userData?.user;
      if (!user) {
        alert("Not authenticated");
        return;
      }

      const { error } = await supabase.from("dogs").insert({
        user_id: user.id,
        name: form.name,
        sex: form.sex || null,
        breed: form.breed || null,
        birth_date: form.birth_date || null,
        reg_number: form.reg_number || null,
        microchip_id: form.microchip_id || null,
        color_markings: form.color_markings || null,
        notes: form.notes || null,
        is_public: false,
        is_for_sale: false,
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      alert("Dog created successfully!");

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={wrap}>
      <h1>🐶 Add New Dog</h1>
      <p style={{ color: "#666" }}>
        Create a structured kennel record (Excel replacement core system)
      </p>

      {/* BASIC */}
      <div style={card}>
        <h3>Basic Info</h3>

        <input
          placeholder="Dog name *"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={input}
        />

        <select
          value={form.sex}
          onChange={(e) =>
            setForm({ ...form, sex: e.target.value })
          }
          style={input}
        >
          <option value="">Select sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* BREEDING DATA */}
      <div style={card}>
        <h3>Breeding Data</h3>

        <input
          placeholder="Breed"
          value={form.breed}
          onChange={(e) =>
            setForm({ ...form, breed: e.target.value })
          }
          style={input}
        />

        <input
          type="date"
          placeholder="Birth date"
          value={form.birth_date}
          onChange={(e) =>
            setForm({ ...form, birth_date: e.target.value })
          }
          style={input}
        />
      </div>

      {/* IDENTIFICATION */}
      <div style={card}>
        <h3>Identification</h3>

        <input
          placeholder="Registration number"
          value={form.reg_number}
          onChange={(e) =>
            setForm({ ...form, reg_number: e.target.value })
          }
          style={input}
        />

        <input
          placeholder="Microchip ID"
          value={form.microchip_id}
          onChange={(e) =>
            setForm({ ...form, microchip_id: e.target.value })
          }
          style={input}
        />
      </div>

      {/* APPEARANCE */}
      <div style={card}>
        <h3>Appearance</h3>

        <textarea
          placeholder="Color / markings"
          value={form.color_markings}
          onChange={(e) =>
            setForm({ ...form, color_markings: e.target.value })
          }
          style={input}
        />
      </div>

      {/* NOTES */}
      <div style={card}>
        <h3>Notes</h3>

        <textarea
          placeholder="Health, behavior, breeder notes..."
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
          style={input}
        />
      </div>

      {/* ACTIONS */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={createDog}
          disabled={loading}
          style={btn}
        >
          {loading ? "Creating..." : "Create Dog"}
        </button>
      </div>
    </div>
  );
}

// -------------------------
// STYLES
// -------------------------
const wrap: React.CSSProperties = {
  maxWidth: 700,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const card: React.CSSProperties = {
  marginTop: 20,
  padding: 20,
  border: "1px solid #eee",
  borderRadius: 12,
  background: "#fff",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  padding: "12px 16px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
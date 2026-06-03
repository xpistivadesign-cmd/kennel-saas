"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditDogPage() {
  const params = useParams();
  const router = useRouter();

  const dogId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sex: "",
    breed: "",
    birth_date: "",
    reg_number: "",
    microchip_id: "",
    color_markings: "",
    notes: "",
    is_public: false,
    is_for_sale: false,
  });

  // -------------------------
  // LOAD DOG
  // -------------------------
  useEffect(() => {
    async function loadDog() {
      if (!dogId) return;

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", dogId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setError("Dog not found or access denied");
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || "",
        sex: data.sex || "",
        breed: data.breed || "",
        birth_date: data.birth_date || "",
        reg_number: data.reg_number || "",
        microchip_id: data.microchip_id || "",
        color_markings: data.color_markings || "",
        notes: data.notes || "",
        is_public: data.is_public || false,
        is_for_sale: data.is_for_sale || false,
      });

      setLoading(false);
    }

    loadDog();
  }, [dogId]);

  // -------------------------
  // SAVE
  // -------------------------
  async function save() {
    setSaving(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        alert("Not authenticated");
        return;
      }

      const { error } = await supabase
        .from("dogs")
        .update({
          name: form.name,
          sex: form.sex,
          breed: form.breed,
          birth_date: form.birth_date,
          reg_number: form.reg_number,
          microchip_id: form.microchip_id,
          color_markings: form.color_markings,
          notes: form.notes,
          is_public: form.is_public,
          is_for_sale: form.is_for_sale,
        })
        .eq("id", dogId)
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      alert("Dog updated successfully!");
      router.push(`/dogs/${dogId}`);
    } finally {
      setSaving(false);
    }
  }

  // -------------------------
  // UI STATES
  // -------------------------
  if (loading) {
    return <div style={wrap}>Loading dog...</div>;
  }

  if (error) {
    return (
      <div style={wrap}>
        <h2 style={{ color: "red" }}>Error</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/dashboard")}>
          Back
        </button>
      </div>
    );
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={wrap}>
      <h1>✏️ Edit Dog</h1>

      {/* BASIC */}
      <div style={card}>
        <h3>Basic</h3>

        <input
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          placeholder="Name"
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

      {/* BREEDING */}
      <div style={card}>
        <h3>Breeding</h3>

        <input
          value={form.breed}
          onChange={(e) =>
            setForm({ ...form, breed: e.target.value })
          }
          placeholder="Breed"
          style={input}
        />

        <input
          type="date"
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
          value={form.reg_number}
          onChange={(e) =>
            setForm({ ...form, reg_number: e.target.value })
          }
          placeholder="Registration number"
          style={input}
        />

        <input
          value={form.microchip_id}
          onChange={(e) =>
            setForm({ ...form, microchip_id: e.target.value })
          }
          placeholder="Microchip ID"
          style={input}
        />
      </div>

      {/* NOTES */}
      <div style={card}>
        <h3>Appearance & Notes</h3>

        <textarea
          value={form.color_markings}
          onChange={(e) =>
            setForm({ ...form, color_markings: e.target.value })
          }
          placeholder="Color / markings"
          style={input}
        />

        <textarea
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
          placeholder="Notes"
          style={input}
        />
      </div>

      {/* FLAGS */}
      <div style={card}>
        <h3>Status</h3>

        <label>
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) =>
              setForm({ ...form, is_public: e.target.checked })
            }
          />
          Public profile
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={form.is_for_sale}
            onChange={(e) =>
              setForm({ ...form, is_for_sale: e.target.checked })
            }
          />
          For sale
        </label>
      </div>

      {/* SAVE */}
      <button onClick={save} disabled={saving} style={btn}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
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
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const btn: React.CSSProperties = {
  marginTop: 20,
  padding: "12px 16px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};
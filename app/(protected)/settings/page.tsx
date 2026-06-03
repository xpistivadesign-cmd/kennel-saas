"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Settings = {
  id?: string;
  kennel_name: string | null;
  phone: string | null;
  address: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  logo_url: string | null;
};

export default function SettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    kennel_name: "",
    phone: "",
    address: "",
    primary_color: "#0070f3",
    secondary_color: "#111111",
    accent_color: "#f5f5f5",
    logo_url: "",
  });

  async function loadSettings() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      router.push("/login");
      return;
    }

    const { data } = await supabase
      .from("kennel_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSettings(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSettings() {
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) return;

    const { error } = await supabase
      .from("kennel_settings")
      .upsert({
        user_id: user.id,
        kennel_name: settings.kennel_name,
        phone: settings.phone,
        address: settings.address,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        accent_color: settings.accent_color,
        logo_url: settings.logo_url,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Settings saved successfully!");
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    const fileExt = file.name.split(".").pop();
    const fileName = `logos/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("kennel-assets")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data } = supabase.storage
      .from("kennel-assets")
      .getPublicUrl(fileName);

    setSettings((prev) => ({
      ...prev,
      logo_url: data.publicUrl,
    }));
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading settings...</div>;
  }

  return (
    <div style={container}>
      
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => router.push("/")} style={backBtn}>
          ← Back
        </button>

        <h1>⚙️ Kennel Settings</h1>
        <p style={{ color: "#666" }}>
          Customize your white-label kennel branding
        </p>
      </div>

      {/* LOGO */}
      <div style={card}>
        <h3>Logo</h3>

        {settings.logo_url && (
          <img
            src={settings.logo_url}
            style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12 }}
          />
        )}

        <input type="file" onChange={uploadLogo} />
      </div>

      {/* BASIC INFO */}
      <div style={card}>
        <h3>Basic Info</h3>

        <input
          placeholder="Kennel Name"
          value={settings.kennel_name || ""}
          onChange={(e) =>
            setSettings({ ...settings, kennel_name: e.target.value })
          }
          style={input}
        />

        <input
          placeholder="Phone"
          value={settings.phone || ""}
          onChange={(e) =>
            setSettings({ ...settings, phone: e.target.value })
          }
          style={input}
        />

        <input
          placeholder="Address"
          value={settings.address || ""}
          onChange={(e) =>
            setSettings({ ...settings, address: e.target.value })
          }
          style={input}
        />
      </div>

      {/* COLORS */}
      <div style={card}>
        <h3>Brand Colors</h3>

        <label>Primary</label>
        <input
          type="color"
          value={settings.primary_color || "#0070f3"}
          onChange={(e) =>
            setSettings({ ...settings, primary_color: e.target.value })
          }
          style={{ width: "100%", height: 40 }}
        />

        <label>Secondary</label>
        <input
          type="color"
          value={settings.secondary_color || "#111111"}
          onChange={(e) =>
            setSettings({ ...settings, secondary_color: e.target.value })
          }
          style={{ width: "100%", height: 40 }}
        />

        <label>Accent</label>
        <input
          type="color"
          value={settings.accent_color || "#f5f5f5"}
          onChange={(e) =>
            setSettings({ ...settings, accent_color: e.target.value })
          }
          style={{ width: "100%", height: 40 }}
        />
      </div>

      {/* SAVE */}
      <button onClick={saveSettings} style={saveBtn}>
        {saving ? "Saving..." : "💾 Save Settings"}
      </button>
    </div>
  );
}

/* STYLES */

const container = {
  maxWidth: 700,
  margin: "40px auto",
  padding: 20,
  fontFamily: "sans-serif",
};

const card = {
  border: "1px solid #eee",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const input = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
};

const saveBtn = {
  width: "100%",
  padding: 14,
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: "bold",
};

const backBtn = {
  marginBottom: 10,
  padding: "6px 10px",
  border: "1px solid #ccc",
  background: "white",
  borderRadius: 8,
};
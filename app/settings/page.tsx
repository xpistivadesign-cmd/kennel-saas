"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [kennelId, setKennelId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0070f3");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadKennelData();
  }, []);

  async function loadKennelData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("kennels")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setKennelId(data.id);
        setName(data.name || "");
        setDescription(data.description || "");
        setWebsite(data.website || "");
        setPrimaryColor(data.primary_color || "#0070f3");
        setSecondaryColor(data.secondary_color || "#ffffff");
        setLogoUrl(data.logo_url || null);
      }
    } catch (error: any) {
      console.error(error);
      alert("Hiba a kennel adatok betöltésekor: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);

    const payload = {
      name,
      description,
      website,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
    };

    try {
      if (kennelId) {
        const { error } = await supabase
          .from("kennels")
          .update(payload)
          .eq("id", kennelId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("kennels")
          .insert({
            ...payload,
            user_id: userId,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setKennelId(data.id);
        }
      }

      await loadKennelData();
      alert("Beállítások sikeresen mentve 💾");
    } catch (error: any) {
      console.error(error);
      alert("Mentési hiba: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file || !userId) return;

      setUploadingLogo(true);

      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${userId}/logo-${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("kennel-logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("kennel-logos")
        .getPublicUrl(fileName);

      setLogoUrl(data.publicUrl);

      // reset file input (fontos UX fix)
      event.target.value = "";

      alert("Logó feltöltve 🎨 (ne felejtsd el menteni)");
    } catch (error: any) {
      console.error(error);
      alert("Logó feltöltési hiba: " + error.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Beállítások betöltése...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <button
        onClick={() => router.push("/")}
        style={{ marginBottom: 20, padding: "8px 12px", cursor: "pointer" }}
      >
        ⬅️ Vissza
      </button>

      <h1>⚙️ Kennel Settings</h1>
      <p style={{ color: "#666" }}>
        Itt tudod testre szabni a kennel profilodat.
      </p>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>

        <div>
          <label><b>Kennel neve</b></label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label><b>Leírás</b></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div>
          <label><b>Weboldal</b></label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          <div>
            <label><b>Elsődleges szín</b></label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>

          <div>
            <label><b>Másodlagos szín</b></label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label><b>Logó</b></label>

          {logoUrl && (
            <img
              src={logoUrl}
              alt="logo"
              style={{ width: 120, height: 120, objectFit: "cover", marginTop: 10 }}
            />
          )}

          <input
            type="file"
            accept="image/*"
            disabled={uploadingLogo}
            onChange={handleLogoUpload}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 10,
            padding: 12,
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {saving ? "Mentés..." : "Mentés 💾"}
        </button>

      </form>
    </div>
  );
}

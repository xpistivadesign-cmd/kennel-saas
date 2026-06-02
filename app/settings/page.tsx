"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kennelId, setKennelId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const [primaryColor, setPrimaryColor] = useState("#0070f3");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const router = useRouter();

  useEffect(() => {
    loadKennel();
  }, []);

  async function loadKennel() {
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
    } catch (err: any) {
      console.error(err);
      alert("Hiba: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);

    const slug = slugify(name);

    const updateData = {
      name,
      description,
      website,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
      slug,
    };

    try {
      if (kennelId) {
        const { error } = await supabase
          .from("kennels")
          .update(updateData)
          .eq("id", kennelId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("kennels")
          .insert({
            ...updateData,
            user_id: userId,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setKennelId(data.id);
        }
      }

      alert("Beállítások mentve 💾");
    } catch (err: any) {
      console.error(err);
      alert("Mentési hiba: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    try {
      if (!userId) return;

      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingLogo(true);

      const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${userId}/${Date.now()}-${cleanName}`;

      const { error: uploadError } = await supabase.storage
        .from("kennel-logos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("kennel-logos")
        .getPublicUrl(fileName);

      setLogoUrl(data.publicUrl);
    } catch (err: any) {
      console.error(err);
      alert("Upload hiba: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/k/${slug}`;
    navigator.clipboard.writeText(url);
    alert("Link kimásolva: " + url);
  }

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h3>Betöltés...</h3>
      </div>
    );
  }

  const currentSlug = slugify(name);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <button onClick={() => router.push("/")} style={{ marginBottom: 20 }}>
        ⬅️ Dashboard
      </button>

      <h1>⚙️ Kennel Settings</h1>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 20 }}>
        
        <input
          placeholder="Kennel neve"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: 8 }}
        />

        <textarea
          placeholder="Leírás"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: 8 }}
        />

        <input
          placeholder="Weboldal"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ padding: 8 }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
          />
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
          />
        </div>

        <input type="file" onChange={handleLogoUpload} disabled={uploadingLogo} />

        {logoUrl && (
          <img src={logoUrl} style={{ width: 120, borderRadius: 8 }} />
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: 12,
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {saving ? "Mentés..." : "Mentés 💾"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <div>
        <h3>🔗 Share link</h3>
        <p>/k/{currentSlug}</p>

        <button
          onClick={() => copyLink(currentSlug)}
          style={{
            padding: 10,
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Link másolása
        </button>
      </div>
    </div>
  );
}

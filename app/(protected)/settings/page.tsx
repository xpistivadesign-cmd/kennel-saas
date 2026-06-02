"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
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
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("kennels")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setKennelId(data.id);
      setName(data.name || "");
      setDescription(data.description || "");
      setWebsite(data.website || "");
      setPrimaryColor(data.primary_color || "#0070f3");
      setSecondaryColor(data.secondary_color || "#ffffff");
      setLogoUrl(data.logo_url || null);
    }

    setLoading(false);
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

    if (kennelId) {
      await supabase
        .from("kennels")
        .update(updateData)
        .eq("id", kennelId);
    } else {
      const { data } = await supabase
        .from("kennels")
        .insert({ ...updateData, user_id: userId })
        .select()
        .single();

      if (data) setKennelId(data.id);
    }

    setSaving(false);
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadingLogo(true);

    const clean = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `${userId}/${Date.now()}-${clean}`;

    await supabase.storage
      .from("kennel-logos")
      .upload(fileName, file, { upsert: true });

    const { data } = supabase.storage
      .from("kennel-logos")
      .getPublicUrl(fileName);

    setLogoUrl(data.publicUrl);

    setUploadingLogo(false);
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/k/${slug}`;
    navigator.clipboard.writeText(url);
    alert(url);
  }

  if (loading) return <div>Loading...</div>;

  const currentSlug = slugify(name);

  return (
    <div style={{ padding: 20 }}>
      <h1>Settings</h1>

      <form onSubmit={handleSave}>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <button type="submit">{saving ? "Mentés..." : "Mentés"}</button>
      </form>

      {kennelId && (
        <button onClick={() => copyLink(currentSlug)}>
          Share link
        </button>
      )}
    </div>
  );
}
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type BrandingSettings = {
  theme_mode: string;
  preset_palette: string;
  primary_color: string;
  accent_color: string;
  bg_color: string;
  card_color: string;
  ui_style: string;
  ui_radius: string;
  ui_animation: string;
  ui_density: string;
  kennel_name: string;
};

type Props = {
  settings: BrandingSettings;
  saveBrandingAction: (fd: FormData) => Promise<void>;
};

const PALETTES = [
  { id: "midnight", name: "Midnight Neon", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#090A0F" },
  { id: "aurora", name: "Aurora", primary: "#6D28D9", accent: "#22D3EE", bg: "#030712", card: "#111827" },
  { id: "electric", name: "Electric", primary: "#4F46E5", accent: "#00FFA3", bg: "#050505", card: "#111111" },
  { id: "royal", name: "Royal", primary: "#D4AF37", accent: "#FFF4CC", bg: "#080808", card: "#181818" },
  { id: "lime", name: "Violet Lime", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#101010" },
  { id: "custom", name: "Custom Builder", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#090A0F" },
];

export default function BrandingClient({ settings, saveBrandingAction }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [themeMode, setThemeMode] = useState(settings.theme_mode ?? "dark");
  const [palette, setPalette] = useState(settings.preset_palette ?? "midnight");
  
  const [primary, setPrimary] = useState(settings.primary_color ?? "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color ?? "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color ?? "#000000");
  const [card, setCard] = useState(settings.card_color ?? "#090A0F");

  const [style, setStyle] = useState(settings.ui_style ?? "glass");
  const [radius, setRadius] = useState(settings.ui_radius ?? "medium");
  const [animation, setAnimation] = useState(settings.ui_animation ?? "normal");
  const [density, setDensity] = useState(settings.ui_density ?? "balanced");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  function selectPalette(id: string) {
    setPalette(id);
    const p = PALETTES.find((x) => x.id === id);
    if (!p || id === "custom") return;

    setPrimary(p.primary);
    setAccent(p.accent);
    setBg(themeMode === "light" ? "#FFFFFF" : p.bg);
    setCard(p.card);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); // <-- BLOKKOLJUK A 404-ES NATÍV OLDALUGRÁST!

    const fd = new FormData();
    fd.set("theme_mode", themeMode);
    fd.set("preset_palette", palette);
    fd.set("primary_color", primary);
    fd.set("accent_color", accent);
    fd.set("bg_color", bg);
    fd.set("card_color", card);
    fd.set("ui_style", style);
    fd.set("ui_radius", radius);
    fd.set("ui_animation", animation);
    fd.set("ui_density", density);
    fd.set("kennel_name", kennelName);

    startTransition(async () => {
      await saveBrandingAction(fd);
      router.refresh();
      setTimeout(() => {
        location.reload();
      }, 100);
    });
  }

  return (
    <form onSubmit={submit} className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black">Appearance</h1>
        <p className="opacity-60">Premium Theme & Architecture Control System</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          {/* KENNEL NEVE */}
          <div>
            <label className="font-bold block mb-2">Kennel Megjelenítési Neve</label>
            <input type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-800 text-white" />
          </div>

          {/* MODE */}
          <div>
            <h3 className="font-bold mb-3">Theme Mode</h3>
            <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} className="w-full p-4 rounded-xl bg-black border border-zinc-800 text-white">
              <option value="dark">dark</option>
              <option value="light">light</option>
              <option value="system">system</option>
            </select>
          </div>

          {/* PALETTA SELECTION */}
          <div>
            <h3 className="font-bold mb-3">Márka Paletták</h3>
            <div className="grid grid-cols-2 gap-3">
              {PALETTES.map((p) => (
                <button key={p.id} type="button" onClick={() => selectPalette(p.id)} className={`rounded-2xl p-5 border text-left transition-all ${palette === p.id ? "border-purple-500 bg-zinc-900" : "border-zinc-800 bg-black"}`}>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full" style={{ background: p.primary }} />
                    <div className="w-6 h-6 rounded-full" style={{ background: p.accent }} />
                  </div>
                  <div className="mt-3 font-bold">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM PICKERS */}
          {palette === "custom" && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-black rounded-xl border border-zinc-900 animate-fadeIn">
              <div><label className="text-[10px] block mb-1">Primary Color</label><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-full h-10 bg-transparent cursor-pointer" /></div>
              <div><label className="text-[10px] block mb-1">Accent Color</label><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full h-10 bg-transparent cursor-pointer" /></div>
              <div><label className="text-[10px] block mb-1">Background Color</label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 bg-transparent cursor-pointer" /></div>
              <div><label className="text-[10px] block mb-1">Card Base Color</label><input type="color" value={card} onChange={(e) => setCard(e.target.value)} className="w-full h-10 bg-transparent cursor-pointer" /></div>
            </div>
          )}

          {/* EXTRA STRUKTURÁLIS VÁLASZTÓK */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold block mb-1">STYLE</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="flat">flat</option>
                <option value="glass">glass</option>
                <option value="neon">neon</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1">RADIUS</label>
              <select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="sharp">sharp</option>
                <option value="medium">medium</option>
                <option value="soft">soft</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1">ANIMATION</label>
              <select value={animation} onChange={(e) => setAnimation(e.target.value)} className="w-full p-3 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="minimal">minimal</option>
                <option value="normal">normal</option>
                <option value="dynamic">dynamic</option>
              </select>
            </div>
          </div>

          <button disabled={pending} className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black uppercase tracking-wider text-xs transition-all hover:opacity-90">
            {pending ? "Arculat Mentése..." : "🚀 TELJES ARCULAT ÉLESÍTÉSE"}
          </button>
        </section>

        {/* JOBB OSZLOP: VALÓS IDEJŰ TOKEN PREVIEW */}
        <section className="sticky top-6">
          <div className="rounded-[32px] p-8 border border-white/10" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}11)` }}>
            <div className="rounded-3xl p-6 border" style={{ backgroundColor: card, borderColor: "rgba(255,255,255,0.05)" }}>
              <h2 className="text-xl font-black mb-4" style={{ color: primary }}>🐾 {kennelName}</h2>
              <div className="grid gap-3">
                <div className="p-5 rounded-2xl border" style={{ background: `${primary}18`, borderColor: "rgba(255,255,255,0.03)" }}>Dashboard Card 1 (Violet tónus)</div>
                <div className="p-5 rounded-2xl border" style={{ background: `${accent}18`, borderColor: "rgba(255,255,255,0.03)" }}>Dashboard Card 2 (Lime tónus)</div>
                <div className="p-5 rounded-2xl border" style={{ background: `${primary}10`, borderColor: "rgba(255,255,255,0.03)" }}>Dashboard Card 3 (Mély árnyalat)</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}

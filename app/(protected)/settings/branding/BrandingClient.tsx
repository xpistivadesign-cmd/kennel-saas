"use client";

import { useState, useTransition } from "react";

export const PRESETS = {
  royal_purple: { name: "Királyi Lila", bg: "#0d0814", accent: "#a855f7", heading: "#ffffff", body: "#e9d5ff", cDash: "#1a0f30", cDogs: "#111827", cHeats: "#2d0b1e", cFin: "#062419" },
  midnight_neon: { name: "Éjféli Neon", bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa", cDash: "#16161a", cDogs: "#16161a", cHeats: "#1f0814", cFin: "#041910" },
  luxury_gold: { name: "Gamer Arany", bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa", cDash: "#1c1c1c", cDogs: "#1c1c1c", cHeats: "#2a1a08", cFin: "#1c1c1c" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "royal_purple");

  // Alap szín állapotok
  const [bgColor, setBgColor] = useState(settings.bg_color || "#09090b");
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#3b82f6");
  const [headingColor, setHeadingColor] = useState(settings.text_heading_color || "#ffffff");
  const [bodyColor, setBgBodyColor] = useState(settings.text_body_color || "#a1a1aa");

  // KÁRTYÁK EGYEDI SZÍN ÁLLAPOTAI
  const [cDash, setCDash] = useState(settings.card_dashboard_color || "#1f1c2c");
  const [cDogs, setCDogs] = useState(settings.card_dogs_color || "#111827");
  const [cHeats, setCHeats] = useState(settings.card_heats_color || "#2d0b1e");
  const [cFin, setCFin] = useState(settings.card_finance_color || "#062419");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [previewLogo, setPreviewLogo] = useState<string | null>(settings.logo_url);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white text-xs">
      <div>
        <h1 className="text-3xl font-black tracking-tight">White-Label & Arculat Tervező</h1>
        <p className="text-zinc-500 text-xs mt-1">Állíts be egyedi háttérszínt minden egyes kártyatípushoz külön-külön.</p>
      </div>

      <form 
        action={(fd) => {
          fd.set("theme_mode", themeMode);
          fd.set("preset_palette", selectedPreset);
          
          if (themeMode === "preset") {
            const p = PRESETS[selectedPreset as keyof typeof PRESETS];
            fd.set("bg_color", p.bg);
            fd.set("accent_color", p.accent);
            fd.set("text_heading_color", p.heading);
            fd.set("text_body_color", p.body);
            fd.set("card_dashboard_color", p.cDash);
            fd.set("card_dogs_color", p.cDogs);
            fd.set("card_heats_color", p.cHeats);
            fd.set("card_finance_color", p.cFin);
          }

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden egyedi kártyaszín sikeresen elmentve!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-1 gap-6"
      >
        <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />

        <div className="space-y-5 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 block mb-1">Kennel Neve</label>
              <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Logó Feltöltése</label>
              <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-zinc-400 cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'preset' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              ✨ Gyári Mintapaletták
            </button>
            <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'custom' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
              🛠️ Teljesen Egyedi Kártyaszínek
            </button>
          </div>

          {themeMode === "custom" && (
            <div className="space-y-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
              <h4 className="text-sm font-bold text-purple-400">🖥️ Globális Színek</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Fő Háttérszín</label>
                  <div className="flex gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0" /><input type="text" name="bg_color" value={bgColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" /></div>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Kísérőszín (Gombok)</label>
                  <div className="flex gap-2"><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded border-0" /><input type="text" name="accent_color" value={accentColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" /></div>
                </div>
              </div>

              {/* ITT VANNAK A KÜLÖNÁLLÓ KÁRTYÁK PILETTÁI */}
              <h4 className="text-sm font-bold text-amber-400 pt-2 border-t border-zinc-800/60">🎴 Aloldalak Kártyáinak Egyedi Háttérszínei</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Dashboard Kártyák Háttérszíne</label>
                  <div className="flex gap-2">
                    <input type="color" value={cDash} onChange={(e) => setCDash(e.target.value)} className="w-8 h-8 rounded border-0" />
                    <input type="text" name="card_dashboard_color" value={cDash} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Dogs (Kutyák) Kártyák Háttérszíne</label>
                  <div className="flex gap-2">
                    <input type="color" value={cDogs} onChange={(e) => setCDogs(e.target.value)} className="w-8 h-8 rounded border-0" />
                    <input type="text" name="card_dogs_color" value={cDogs} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="text-zinc-400 block mb-1">Heats (Tüzelések) Kártyák Háttérszíne</label>
                  <div className="flex gap-2">
                    <input type="color" value={cHeats} onChange={(e) => setCHeats(e.target.value)} className="w-8 h-8 rounded border-0" />
                    <input type="text" name="card_heats_color" value={cHeats} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="text-zinc-400 block mb-1">Finance (Pénzügy) Kártyák Háttérszíne</label>
                  <div className="flex gap-2">
                    <input type="color" value={cFin} onChange={(e) => setCFin(e.target.value)} className="w-8 h-8 rounded border-0" />
                    <input type="text" name="card_finance_color" value={cFin} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-zinc-400 block mb-1">Betűtípus</label>
              <select name="google_font_name" defaultValue={settings.google_font_name} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white">
                <option value="Inter">Inter</option>
                <option value="Poppins">Poppins</option>
                <option value="Cinzel">Cinzel</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Ikonok Stílusa</label>
              <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white">
                <option value="minimal">Letisztult</option>
                <option value="neon">Izzó Neon</option>
                <option value="glass-box">Glass-box</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="w-full bg-emerald-500 text-black font-black p-3.5 rounded-xl uppercase tracking-wider text-xs">
            🚀 TELJES EGYEDI ARCULAT MENTÉSE
          </button>
        </div>
      </form>
    </div>
  );
}

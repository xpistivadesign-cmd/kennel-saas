"use client";

import { useState } from "react";

export const PRESETS = {
  royal_purple: { name: "Királyi Lila", bg: "#ba24ff", accent: "#eab308", heading: "#ffffff", body: "#f3e8ff" },
  midnight_neon: { name: "Éjféli Neon", bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa" },
  luxury_gold: { name: "Gamer Arany", bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa" },
  soft_beige: { name: "Elegáns Bézs", bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "royal_purple");

  const [bgColor, setBgColor] = useState(settings.bg_color || "#09090b");
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#3b82f6");
  const [headingColor, setHeadingColor] = useState(settings.text_heading_color || "#ffffff");
  const [bodyColor, setBodyColor] = useState(settings.text_body_color || "#a1a1aa");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  const activeBg = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].bg : bgColor;
  const activeAccent = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].accent : accentColor;
  const activeHeading = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].heading : headingColor;
  const activeBody = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].body : bodyColor;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white text-xs">
      <div>
        <h1 className="text-3xl font-black font-sans tracking-tight">White-Label & Arculat Tervező</h1>
        <p className="text-zinc-500 text-xs mt-1">Alakítsd át a szoftvert prémium dizájn-kártyákkal és intelligens ikon-csoportokkal.</p>
      </div>

      {/* NATÍV MEGBÍZHATÓ FORM BEKÜLDÉS */}
      <form 
        action={saveBrandingAction} 
        encType="multipart/form-data" 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
        <input type="hidden" name="theme_mode" value={themeMode} />
        <input type="hidden" name="preset_palette" value={selectedPreset} />

        <div className="lg:col-span-2 space-y-5 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
          
          {/* IDENTITÁS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">🏨 Kennel Azonosítók</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Kennel Neve (Menühöz)</label>
                <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Logó Kép Feltöltése (Gépről/Telóról)</label>
                <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* VÁLASZTÓ */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">🎨 Megjelenés Típusa</h3>
            <div className="flex gap-3">
              <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'preset' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                ✨ Luxus Témacsomagok
              </button>
              <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'custom' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                🛠️ Kézi Színbeállítások
              </button>
            </div>
          </div>

          {/* FIX PALETTÁK */}
          {themeMode === "preset" && (
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              {Object.entries(PRESETS).map(([key, p]: any) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPreset(key)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? 'border-white bg-zinc-800/40 shadow-lg' : 'border-zinc-800 bg-black/40'}`}
                >
                  <span className="font-bold text-white mb-2">{p.name}</span>
                  <div className="flex gap-1 h-3 w-full rounded overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: p.bg }} />
                    <div className="flex-1" style={{ backgroundColor: p.accent }} />
                    <div className="flex-1" style={{ backgroundColor: p.heading }} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* EGYEDI SZÍNEK */}
          {themeMode === "custom" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
              <div>
                <label className="text-zinc-400 block mb-1">Háttérszín</label>
                <div className="flex gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" /><input type="text" name="bg_color" value={bgColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Kísérőszín</label>
                <div className="flex gap-2"><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" /><input type="text" name="accent_color" value={accentColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div className="pt-2">
                <label className="text-zinc-400 block mb-1">Főcímek betűszíne</label>
                <div className="flex gap-2"><input type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" /><input type="text" name="text_heading_color" value={headingColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div className="pt-2">
                <label className="text-zinc-400 block mb-1">Leírások betűszíne</label>
                <div className="flex gap-2"><input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" /><input type="text" name="text_body_color" value={bodyColor} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
            </div>
          )}

          {/* REJTETT ELKÜLDŐ ALAPÉRTELMEZÉSEK HA PRESET VAN */}
          {themeMode === "preset" && (
            <>
              <input type="hidden" name="bg_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].bg} />
              <input type="hidden" name="accent_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].accent} />
              <input type="hidden" name="text_heading_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].heading} />
              <input type="hidden" name="text_body_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].body} />
            </>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-zinc-400 block mb-1">Betűtípus</label>
              <select name="google_font_name" defaultValue={settings.google_font_name} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white">
                <option value="Inter">Inter (Letisztult)</option>
                <option value="Poppins">Poppins (Karakteres)</option>
                <option value="Cinzel">Cinzel (Királyi Luxus)</option>
                <option value="Playfair Display">Playfair (Klasszikus)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Ikonok Stílusa</label>
              <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white">
                <option value="minimal">Letisztult</option>
                <option value="neon">Izzó Neon</option>
                <option value="glass-box">Színes üveg-dobozos (Prémium)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">📄 Szerződés Generátor Hivatalos Adatok</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Tenyésztő / Tulajdonos Neve</label>
              <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Pl. Sz Krisztina" className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Székhely Cím</label>
                <input type="text" name="kennel_address" defaultValue={settings.kennel_address} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Adószám</label>
                <input type="text" name="tax_number" defaultValue={settings.tax_number} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-500 text-black font-black p-3.5 rounded-xl uppercase tracking-wider transition-all duration-200 text-xs">
            🚀 VÁLTOZTATÁSOK ÉLESÍTÉSE ÉS LOGÓ FELTÖLTÉSE
          </button>
        </div>

        {/* ELŐNÉZET DOBOZ */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 h-fit sticky top-6 space-y-4">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">✨ Élő Előnézet</span>
          <div className="p-5 rounded-xl space-y-4 border border-zinc-800" style={{ backgroundColor: activeBg }}>
            <h4 className="text-sm font-black" style={{ color: activeHeading }}>{kennelName}</h4>
            <p className="text-[11px] leading-relaxed opacity-80" style={{ color: activeBody }}>A betűk és a gombok azonnal frissülnek.</p>
            <button type="button" className="w-full p-2.5 rounded-xl font-bold text-black" style={{ backgroundColor: activeAccent }}>Minta Gomb</button>
          </div>
        </div>
      </form>
    </div>
  );
}

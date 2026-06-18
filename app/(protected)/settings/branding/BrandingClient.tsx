"use client";
import { useState } from "react";

// Előre definiált dizájner paletták
export const PRESETS = {
  royal_purple: { name: "Királyi Lila", bg: "#ba24ff", accent: "#6d17eb", heading: "#ffffff", body: "#f3e8ff", card: "rgba(0,0,0,0.15)" },
  midnight_neon: { name: "Éjféli Neon", bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa", card: "rgba(255,255,255,0.03)" },
  luxury_gold: { name: "Gamer Arany", bg: "#1c1917", accent: "#eab308", heading: "#fafaf9", body: "#d6d3d1", card: "rgba(255,255,255,0.02)" },
  soft_beige: { name: "Elegáns Bézs", bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c", card: "rgba(0,0,0,0.03)" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "royal_purple");
  
  // Szín állapotok az egyedi módhoz
  const [bgColor, setBgColor] = useState(settings.bg_color || "#09090b");
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#3b82f6");
  const [headingColor, setHeadingColor] = useState(settings.text_heading_color || "#ffffff");
  const [bodyColor, setBodyColor] = useState(settings.text_body_color || "#a1a1aa");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black">White-Label & Teljes Arculat</h1>
        <p className="text-xs opacity-60">Szabd személyre a teljes szoftver kinézetét palettákkal vagy saját színekkel.</p>
      </div>

      <form action={saveBrandingAction} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
          
          {/* KENNEL IDENTITÁS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2">📋 Kennel Alapadatok</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] block text-zinc-400 mb-1">Kennel Neve</label>
                <input type="text" name="kennel_name" defaultValue={settings.kennel_name} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[11px] block text-zinc-400 mb-1">Logó Feltöltése</label>
                <input type="file" name="logo_file" className="w-full bg-black border border-zinc-800 rounded-lg p-1.5 text-xs text-zinc-400" />
                <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
              </div>
            </div>
          </div>

          {/* STÍLUS MÓD KIVÁLASZTÁSA */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2">🎨 Színkezelés Típusa</h3>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => setThemeMode("preset")}
                className={`flex-1 p-2 rounded-xl text-xs font-bold border transition-all ${themeMode === 'preset' ? 'bg-zinc-100 text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}
              >
                ✨ Előre gyártott paletták
              </button>
              <button 
                type="button" 
                onClick={() => setThemeMode("custom")}
                className={`flex-1 p-2 rounded-xl text-xs font-bold border transition-all ${themeMode === 'custom' ? 'bg-zinc-100 text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}
              >
                🛠️ Teljesen egyedi színek
              </button>
            </div>
            <input type="hidden" name="theme_mode" value={themeMode} />
          </div>

          {/* ELŐRE GYÁRTOTT PALETTÁK FÜL */}
          {themeMode === "preset" && (
            <div className="space-y-2">
              <label className="text-[11px] block text-zinc-400">Válassz egy harmonikus stíluscsomagot:</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, p]: any) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPreset(key)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? 'border-white bg-zinc-800/40' : 'border-zinc-800 bg-black/40'}`}
                  >
                    <span className="text-xs font-bold text-white mb-2">{p.name}</span>
                    <div className="flex gap-1 h-4 w-full rounded overflow-hidden">
                      <div className="flex-1" style={{ backgroundColor: p.bg }} />
                      <div className="flex-1" style={{ backgroundColor: p.accent }} />
                      <div className="flex-1" style={{ backgroundColor: p.heading }} />
                    </div>
                  </button>
                ))}
              </div>
              <input type="hidden" name="preset_palette" value={selectedPreset} />
              {/* Küldjük be a paletta értékeit is, ha a szervernek kellene */}
              <input type="hidden" name="bg_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].bg} />
              <input type="hidden" name="accent_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].accent} />
              <input type="hidden" name="text_heading_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].heading} />
              <input type="hidden" name="text_body_color" value={PRESETS[selectedPreset as keyof typeof PRESETS].body} />
            </div>
          )}

          {/* TELJESEN EGYEDI SZÍNEK FÜL */}
          {themeMode === "custom" && (
            <div className="space-y-3 p-3 bg-black/50 rounded-xl border border-zinc-800">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] block text-zinc-400 mb-1">Háttérszín</label>
                  <div className="flex gap-2">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                    <input type="text" name="bg_color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] block text-zinc-400 mb-1">Kísérőszín (Gombok)</label>
                  <div className="flex gap-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                    <input type="text" name="accent_color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] block text-zinc-400 mb-1">Főcímek betűszíne (H1, H2)</label>
                  <div className="flex gap-2">
                    <input type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                    <input type="text" name="text_heading_color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] block text-zinc-400 mb-1">Leírások betűszíne (Paragraph)</label>
                  <div className="flex gap-2">
                    <input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-0" />
                    <input type="text" name="text_body_color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TIPOGRÁFIA ÉS INTEGRÁCIÓK */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] block text-zinc-400 mb-1">Rendszer Betűtípusa</label>
              <select name="google_font_name" defaultValue={settings.google_font_name} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs">
                <option value="Inter">Inter (Letisztult modern)</option>
                <option value="Poppins">Poppins (Geometrikus & Bold)</option>
                <option value="Playfair Display">Playfair (Klasszikus elegáns)</option>
                <option value="JetBrains Mono">Developer Mono (Technikai stílus)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] block text-zinc-400 mb-1">Menü Ikonok Stílusa</label>
              <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs">
                <option value="minimal">Finom & Letisztult</option>
                <option value="neon">Izzó Neon színű</option>
                <option value="glass-box">Üveghatású dobozban</option>
              </select>
            </div>
          </div>

          {/* HIVATALOS ADATOK */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-2">📄 Hivatalos Dokumentum Adatok</h3>
            <div>
              <label className="text-[11px] block text-zinc-400 mb-1">Tenyésztő / Tulajdonos Hivatalos Neve</label>
              <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Pl. Szabó Anna" className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] block text-zinc-400 mb-1">Hivatalos Székhely / Cím</label>
                <input type="text" name="kennel_address" defaultValue={settings.kennel_address} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs" />
              </div>
              <div>
                <label className="text-[11px] block text-zinc-400 mb-1">Adószám / Kamarai szám</label>
                <input type="text" name="tax_number" defaultValue={settings.tax_number} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs p-3 rounded-xl transition-all uppercase tracking-wider">
            ✨ Új Arculat Élesítése és Alkalmazása
          </button>
        </div>

        {/* LIVE PREVIEW BOX */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between h-fit space-y-4">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">✨ Élő előnézet (Live Preview)</div>
          <div 
            className="p-4 rounded-xl space-y-4 border transition-all"
            style={{ 
              backgroundColor: themeMode === 'preset' ? PRESETS[selectedPreset as keyof typeof PRESETS].bg : bgColor,
              color: themeMode === 'preset' ? PRESETS[selectedPreset as keyof typeof PRESETS].body : bodyColor
            }}
          >
            <h4 
              className="text-sm font-black transition-all"
              style={{ color: themeMode === 'preset' ? PRESETS[selectedPreset as keyof typeof PRESETS].heading : headingColor }}
            >
              Üdvözöljük a kenneledben!
            </h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              Így fognak kinézni a szövegek, a címek és az egyedi gombok az éles felületeden.
            </p>
            <button 
              type="button"
              className="w-full p-2 rounded-lg text-xs font-bold text-black transition-all"
              style={{ backgroundColor: themeMode === 'preset' ? PRESETS[selectedPreset as keyof typeof PRESETS].accent : accentColor }}
            >
              Minta Interaktív Gomb
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

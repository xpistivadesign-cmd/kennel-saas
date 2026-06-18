"use client";

import { useState, useTransition } from "react";

// Szigorúan 3 fő színre épülő 12 prémium téma mátrix
export const BRANDING_PRESETS = {
  royal_gold: { name: "Royal Gold (Luxus)", bg: "#09090B", primary: "#D4A45A", accent: "#F4D58D" },
  obsidian_platinum: { name: "Obsidian Platinum (Gyári)", bg: "#0A0B0F", primary: "#E5E7EB", accent: "#8B8D98" },
  midnight_sapphire: { name: "Midnight Sapphire", bg: "#081224", primary: "#3B82F6", accent: "#60A5FA" },
  emerald_prestige: { name: "Emerald Prestige", bg: "#08130D", primary: "#22C55E", accent: "#86EFAC" },
  imperial_purple: { name: "Imperial Purple", bg: "#0E081A", primary: "#7C3AED", accent: "#C084FC" },
  bordeaux_velvet: { name: "Bordeaux Velvet", bg: "#14070B", primary: "#A11A4B", accent: "#F472B6" },
  arctic_ice: { name: "Arctic Ice", bg: "#0F172A", primary: "#E2E8F0", accent: "#67E8F9" },
  copper_heritage: { name: "Copper Heritage", bg: "#15100C", primary: "#C96A2B", accent: "#F59E0B" },
  carbon_red: { name: "Carbon Red (Sport)", bg: "#09090B", primary: "#DC2626", accent: "#F87171" },
  forest_elite: { name: "Forest Elite", bg: "#07100A", primary: "#2E7D32", accent: "#81C784" },
  sandstone_luxury: { name: "Sandstone Luxury", bg: "#12100D", primary: "#E7CFA4", accent: "#C19A6B" },
  graphite_monochrome: { name: "Graphite Monochrome", bg: "#09090B", primary: "#FFFFFF", accent: "#71717A" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "obsidian_platinum");

  // Custom picker állapotok
  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");
  const [customPrimary, setCustomPrimary] = useState("#E5E7EB");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  // Aktuális színek kiszámítása az élő előnézethez
  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.obsidian_platinum;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentPrimary = themeMode === "preset" ? pData.primary : customPrimary;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;

  // 🔒 INTELIGENS KONTRASZT-LOCK MECHANIZMUS (WCAG Delta-E alapú fényerő mérés)
  const checkContrastValid = (hex1: string, hex2: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return {
        r: parseInt(h.substr(0, 2), 16) || 0,
        g: parseInt(h.substr(2, 2), 16) || 0,
        b: parseInt(h.substr(4, 2), 16) || 0,
      };
    };
    const c1 = getRGB(hex1);
    const c2 = getRGB(hex2);
    const yiq1 = ((c1.r * 299) + (c1.g * 587) + (c1.b * 114)) / 1000;
    const yiq2 = ((c2.r * 299) + (c2.g * 587) + (c2.b * 114)) / 1000;
    
    // Ha a két szín fényerősség különbsége kisebb mint 45 pont, a kontraszt túl gyenge, olvashatatlan
    return Math.abs(yiq1 - yiq2) > 45;
  };

  const isContrastValid = themeMode === "preset" ? true : checkContrastValid(customBg, customAccent);

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white text-xs">
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;600;900&display=swap`} />

      <div>
        <h1 className="text-3xl font-black tracking-tight">Premium White-Label OS</h1>
        <p className="text-zinc-500 text-xs mt-1">Válassz a 12 prémium, minimalista dizájn-preset közül, vagy építs sajátot szigorú kontraszt-védelemmel.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (!isContrastValid) return;
          const fd = new FormData(e.currentTarget);
          fd.set("theme_mode", themeMode);
          fd.set("preset_palette", selectedPreset);
          fd.set("bg_color", currentBg);
          fd.set("accent_color", currentAccent);

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Prémium téma sikeresen élesítve!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* BAL OLDAL: BEÁLLÍTÁSOK */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 block mb-1 font-bold">Kennel Neve</label>
              <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white" />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1 font-bold">Logó Cseréje</label>
              <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-500 cursor-pointer" />
              <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
            </div>
          </div>

          {/* KAPCSOLÓ FÜLEK */}
          <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
            <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${themeMode === 'preset' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
              ● Premium Paletták (12 db)
            </button>
            <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${themeMode === 'custom' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>
              🛠️ Custom Theme Builder
            </button>
          </div>

          {/* 12 PRESET MEGJELENÍTÉSE */}
          {themeMode === "preset" && (
            <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {Object.entries(BRANDING_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPreset(key)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? 'border-zinc-400 bg-zinc-900' : 'border-zinc-900 bg-black/40 hover:border-zinc-800'}`}
                >
                  <span className="font-bold text-white mb-3 text-[11px] truncate">{p.name}</span>
                  <div className="flex gap-1 h-3.5 w-full rounded overflow-hidden bg-zinc-950 p-0.5 border border-zinc-900">
                    <div className="w-4 rounded-sm" style={{ backgroundColor: p.bg }} title="Base" />
                    <div className="flex-1 rounded-sm" style={{ backgroundColor: p.primary }} title="Primary" />
                    <div className="flex-1 rounded-sm" style={{ backgroundColor: p.accent }} title="Accent" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ADVANCED CUSTOM BUILDER */}
          {themeMode === "custom" && (
            <div className="p-4 bg-black rounded-xl border border-zinc-900 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-500 block mb-1">1. Base (Háttér)</label>
                  <div className="flex gap-2">
                    <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[10px] text-center font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">2. Primary (Szövegek)</label>
                  <div className="flex gap-2">
                    <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[10px] text-center font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-zinc-500 block mb-1">3. Accent (Kiemelés)</label>
                  <div className="flex gap-2">
                    <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent cursor-pointer" />
                    <input type="text" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-[10px] text-center font-mono" />
                  </div>
                </div>
              </div>

              {/* KONTRASZT-LOCK FIGYELMEZTETŐ JELZÉS */}
              {!isContrastValid && (
                <div className="p-3 bg-red-950/40 border border-red-900 text-red-400 rounded-xl text-[10px] font-bold">
                  ⚠️ AI Kontraszt-Lock: A választott háttér és kiemelőszín között túl kicsi a különbség. Olvashatatlan lenne, a mentés gomb le van tiltva!
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-500 block mb-1">Elegáns Betűtípus</label>
              <select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                <option value="Inter">Inter (Letisztult mérnöki)</option>
                <option value="Poppins">Poppins (Modern geometrikus)</option>
                <option value="Cinzel">Cinzel (Luxus tenyészet)</option>
                <option value="Playfair Display">Playfair Display (Klasszikus)</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 block mb-1">Ikonok Megjelenése</label>
              <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                <option value="minimal">Letisztult minimal</option>
                <option value="neon">Izzó Neon</option>
                <option value="glass-box">Glass-box (Prémium kontúros)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">📄 Dokumentum Generátor Törzsadatok</h4>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tulajdonos Neve" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
              <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Hivatalos Székhely" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
              <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending || !isContrastValid} 
            className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed" 
            style={{ backgroundColor: isContrastValid ? currentAccent : "#27272a", color: "#000000" }}
          >
            {isPending ? "Arculat szinkronizálása..." : "🚀 Prémium Arculat Élesítése"}
          </button>
        </div>

        {/* JOBB OLDAL: APPLE-STYLE LIVE PREVIEW */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Valós Idejű Előnézet</span>
          <div 
            className="border rounded-2xl shadow-2xl p-6 space-y-6 transition-all duration-300"
            style={{ backgroundColor: currentBg, borderColor: `${currentPrimary}15`, fontFamily: `'${fontName}', sans-serif` }}
          >
            <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: `${currentPrimary}10` }}>
              <span className="font-bold text-xs" style={{ color: currentPrimary }}>🐾 {kennelName}</span>
              <span className="text-[10px] opacity-60" style={{ color: currentPrimary }}>Welcome back! 👋</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black tracking-tight" style={{ color: currentPrimary }}>Prémium SaaS Megjelenés</h3>
              <p className="text-[11px] leading-relaxed opacity-75" style={{ color: currentPrimary }}>Szigorú, 3 színre korlátozott minimalista arculat a maximális elegancia érdekében.</p>
            </div>

            <div className="p-4 rounded-xl border flex justify-between items-center" style={{ backgroundColor: `${currentPrimary}04`, borderColor: `${currentPrimary}08` }}>
              <span style={{ color: currentPrimary }}>🐕 Aktív kutyák száma</span>
              <span className="font-black text-sm" style={{ color: currentAccent }}>14 db</span>
            </div>

            <button type="button" className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBg }}>
              Minta Interaktív Gomb
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

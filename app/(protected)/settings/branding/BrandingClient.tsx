"use client";

import { useState, useTransition } from "react";

export const PRESETS = {
  royal_purple: { name: "Királyi Lila", bg: "#ba24ff", accent: "#eab308", heading: "#ffffff", body: "#f3e8ff" },
  midnight_neon: { name: "Éjféli Neon", bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa" },
  luxury_gold: { name: "Gamer Arany", bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa" },
  soft_beige: { name: "Elegáns Bézs", bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "royal_purple");

  const [bgColor, setBgColor] = useState(settings.bg_color || "#09090b");
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#3b82f6");
  const [headingColor, setHeadingColor] = useState(settings.text_heading_color || "#ffffff");
  const [bodyColor, setBodyColor] = useState(settings.text_body_color || "#a1a1aa");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [previewLogo, setPreviewLogo] = useState<string | null>(settings.logo_url);

  const activeBg = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].bg : bgColor;
  const activeAccent = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].accent : accentColor;
  const activeHeading = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].heading : headingColor;
  const activeBody = themeMode === "preset" ? PRESETS[selectedPreset as keyof typeof PRESETS].body : bodyColor;

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-white text-xs">
      <div>
        <h1 className="text-3xl font-black font-sans tracking-tight">White-Label & Arculat Tervező</h1>
        <p className="text-zinc-500 text-xs mt-1">Szabd személyre a szoftver kinézetét.</p>
      </div>

      <form 
        action={(fd) => {
          fd.set("theme_mode", themeMode);
          fd.set("preset_palette", selectedPreset);
          
          if (themeMode === "preset") {
            fd.set("bg_color", PRESETS[selectedPreset as keyof typeof PRESETS].bg);
            fd.set("accent_color", PRESETS[selectedPreset as keyof typeof PRESETS].accent);
            fd.set("text_heading_color", PRESETS[selectedPreset as keyof typeof PRESETS].heading);
            fd.set("text_body_color", PRESETS[selectedPreset as keyof typeof PRESETS].body);
          }

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden arculati elem és fájl sikeresen alkalmazva lett!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />

        <div className="lg:col-span-2 space-y-5 bg-zinc-900/30 border border-zinc-800 p-6 rounded-2xl">
          
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">🏨 Kennel Azonosítók</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Kennel Neve</label>
                <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Logó Feltöltése (Telefonról/Gépől)</label>
                <input type="file" name="logo_file" accept="image/*" onChange={handleLocalFileChange} className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-zinc-400 cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">🎨 Megjelenés Típusa</h3>
            <div className="flex gap-3">
              <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'preset' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                ✨ Témacsomagok
              </button>
              <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 p-2.5 rounded-xl border font-bold text-xs transition-all ${themeMode === 'custom' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-zinc-800'}`}>
                🛠️ Egyedi Színek
              </button>
            </div>
          </div>

          {themeMode === "preset" && (
            <div className="grid grid-cols-2 gap-3">
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
                  </div>
                </button>
              ))}
            </div>
          )}

          {themeMode === "custom" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-black/40 rounded-xl border border-zinc-800">
              <div>
                <label className="text-zinc-400 block mb-1">Háttérszín</label>
                <div className="flex gap-2"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" name="bg_color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Kísérőszín</label>
                <div className="flex gap-2"><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" name="accent_color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div className="pt-2">
                <label className="text-zinc-400 block mb-1">Főcímek színe</label>
                <div className="flex gap-2"><input type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" name="text_heading_color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
              </div>
              <div className="pt-2">
                <label className="text-zinc-400 block mb-1">Szövegek színe</label>
                <div className="flex gap-2"><input type="color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" /><input type="text" name="text_body_color" value={bodyColor} onChange={(e) => setBodyColor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs font-mono" /></div>
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
              <label className="text-zinc-400 block mb-1">Ikonok</label>
              <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white">
                <option value="minimal">Letisztult</option>
                <option value="neon">Izzó Neon</option>
                <option value="glass-box">Glass-box</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-zinc-800/60 pb-1.5">📄 Dokumentum Adatok</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Tenyésztő Neve</label>
              <input type="text" name="owner_name" defaultValue={settings.owner_name} className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-white" />
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

          <button type="submit" disabled={isPending} className="w-full bg-emerald-500 text-black font-black p-3.5 rounded-xl uppercase tracking-wider text-xs">
            {isPending ? "Mentés..." : "🚀 TELJES ARCULAT MENTÉSE ÉS ALKALMAZÁSA"}
          </button>
        </div>

        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 h-fit sticky top-6 space-y-4">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">✨ Élő Előnézet</span>
          <div className="p-5 rounded-xl space-y-4 border border-zinc-800" style={{ backgroundColor: activeBg }}>
            <div className="flex items-center gap-2">
              {previewLogo ? (
                <img src={previewLogo} alt="Preview" className="h-6 max-w-[120px] object-contain" />
              ) : (
                <span style={{ color: activeAccent }}>🐾</span>
              )}
              <h4 className="text-sm font-black m-0" style={{ color: activeHeading }}>{kennelName}</h4>
            </div>
            <button type="button" className="w-full p-2.5 rounded-xl font-bold text-black" style={{ backgroundColor: activeAccent }}>Minta Gomb</button>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

// A képeid alapján kinyert, szigorúan 3-3 színből álló prémium paletták
export const BRANDING_PRESETS = {
  deep_burgundy: { name: "Mély Burgundi & Krém", bg: "#0E0D0D", heading: "#EEDCC1", accent: "#5E001A" },
  royal_navy: { name: "Navy & Elegáns Arany", bg: "#1F2A44", heading: "#E8DCC8", accent: "#C6A75E" },
  cyber_neon: { name: "Cyberpunk Kék & Lila", bg: "#0E48C1", heading: "#3DF8F8", accent: "#E23AFB" },
  neon_lime: { name: "High-Tech Sötét & Lime", bg: "#8116E0", heading: "#FEFFFC", accent: "#DDFF00" },
  behance_pastel: { name: "Behance Pasztell", bg: "#F5F5F5", heading: "#5A4EFF", accent: "#EEA0FF" },
  travel_app: { name: "Travel App Minimal", bg: "#F5F5F5", heading: "#4B5563", accent: "#E2F4A6" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "deep_burgundy");

  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");
  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  const [widgets, setWidgets] = useState({
    dogs: true, heats: true, litters: true, finance: true, shows: true, calendar: true
  });

  const applyWorkspacePreset = (mode: string) => {
    if (mode === "breeding") {
      setWidgets({ dogs: true, heats: true, litters: true, finance: false, shows: false, calendar: true });
    } else if (mode === "show") {
      setWidgets({ dogs: true, heats: false, litters: false, finance: false, shows: true, calendar: true });
    } else if (mode === "finance") {
      setWidgets({ dogs: false, heats: false, litters: false, finance: true, shows: false, calendar: true });
    } else {
      setWidgets({ dogs: true, heats: true, litters: true, finance: true, shows: true, calendar: true });
    }
    alert(`Workspace átváltva: ${mode.toUpperCase()} MODE.`);
  };

  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.deep_burgundy;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;

  // Golyóálló Kontraszt-Lock teljes matematikai lezárással
  const checkContrastValid = (bgHex: string, textHex: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return { 
        r: parseInt(h.substr(0, 2), 16) || 0, 
        g: parseInt(h.substr(2, 2), 16) || 0, 
        b: parseInt(h.substr(4, 2), 16) || 0 
      };
    };
    const c1 = getRGB(bgHex); 
    const c2 = getRGB(textHex);
    const yiq1 = ((c1.r * 299) + (c1.g * 587) + (c1.b * 114)) / 1000;
    const yiq2 = ((c2.r * 299) + (c2.g * 587) + (c2.b * 114)) / 1000;
    return Math.abs(yiq1 - yiq2) > 50; 
  };

  const isContrastValid = themeMode === "preset" ? true : checkContrastValid(customBg, customHeading);

  const subTabs = [
    { id: "my-kennel", label: "🏢 My Kennel (Branding)" },
    { id: "appearance", label: "🎨 Appearance & Theme" },
    { id: "dashboard", label: "🖥️ Dashboard Layout" },
    { id: "notifications", label: "🔔 Notifications & Alerts" },
    { id: "automations", label: "⚙️ Automations & Power Actions" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white text-xs">
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;600;900&display=swap`} />

      <div className="border-b border-zinc-900 pb-4">
        <h1 className="text-3xl font-black tracking-tight">🎛️ Advanced Control Panel</h1>
        <p className="text-zinc-500 text-xs mt-1">Saját vizuális paletták a beküldött minták alapján.</p>
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
          fd.set("text_heading_color", currentHeading);

          Object.entries(widgets).forEach(([k, v]) => fd.set(`widget_${k}`, String(v)));

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden konfiguráció sikeresen elmentve!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL OSZLOP */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          <span className="text-[9px] uppercase font-bold text-zinc-600 px-3 py-1 block">Rendszerbeállítások</span>
          {subTabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/40'}`}>{t.label}</button>
          ))}
        </div>

        {/* KÖZÉPSŐ OSZLOP */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl min-h-[460px] flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* TABS 1: MY KENNEL */}
            {activeTab === "my-kennel" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-900 pb-2">🏢 Kennel Alapadatok & White-Label</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Kennel Menü Neve</label>
                    <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Logó Feltöltése</label>
                    <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 3-Színű Egyedi Paletták</h3>
                
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'preset' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>Kép Alapú Presetek</button>
                  <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'custom' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>Custom Builder</button>
                </div>

                {themeMode === "preset" && (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {Object.entries(BRANDING_PRESETS).map(([key, p]) => (
                      <button key={key} type="button" onClick={() => setSelectedPreset(key)} className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? 'border-zinc-400 bg-zinc-900' : 'border-zinc-900 bg-black/40'}`}>
                        <span className="font-bold text-white mb-2 text-[10px] truncate">{p.name}</span>
                        <div className="flex gap-1 h-3 w-full rounded overflow-hidden bg-zinc-950 p-0.5 border border-zinc-900">
                          <div className="w-4 rounded-sm" style={{ backgroundColor: p.bg }} />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.heading }} />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {themeMode === "custom" && (
                  <div className="p-4 bg-black rounded-xl border border-zinc-900 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Háttér</label><input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Szöveg</label><input type="color" value={customHeading} onChange={(e) => setCustomHeading(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Accent</label><input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                    </div>
                    {!isContrastValid && <div className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-[10px] font-bold">⚠️ Kontraszt figyelmeztetés!</div>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-zinc-500 block mb-1">Betűtípus</label><select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white"><option value="Inter">Inter</option><option value="Poppins">Poppins</option><option value="Cinzel">Cinzel</option></select></div>
                  <div><label className="text-zinc-500 block mb-1">Ikonok stílusa</label><select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white"><option value="minimal">Minimal</option></select></div>
                </div>
              </div>
            )}

            {/* TABS 3, 4, 5 STUB */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-900 pb-2">🚀 Workspace Presets</h3>
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => applyWorkspacePreset("all")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px]">🌟 All Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("breeding")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px]">🍼 Breeding</button>
                  <button type="button" onClick={() => applyWorkspacePreset("show")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px]">🏆 Show Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("finance")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px]">💰 Finance</button>
                </div>
              </div>
            )}
            {activeTab === "notifications" && <div className="p-4 bg-zinc-900 text-zinc-400 rounded-xl">Értesítések beállításai.</div>}
            {activeTab === "automations" && <div className="p-4 bg-zinc-900 text-zinc-400 rounded-xl">Automatizált munkafolyamatok.</div>}

          </div>

          <button type="submit" disabled={isPending || !isContrastValid} className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all mt-4" style={{ backgroundColor: isContrastValid ? currentAccent : "#27272a", color: isContrastValid ? currentBg : "#71717a" }}>
            {isPending ? "Mentés..." : "🚀 ARCULAT MENTÉSE"}
          </button>
        </div>

        {/* JOBB OSZLOP: ELŐNÉZET */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Élő Előnézet</span>
          <div className="border rounded-2xl shadow-2xl p-5 space-y-5 transition-all duration-300" style={{ backgroundColor: currentBg, borderColor: `${currentHeading}15`, fontFamily: `'${fontName}', sans-serif` }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${currentHeading}10` }}>
              <span className="font-bold text-xs" style={{ color: currentHeading }}>🐾 {kennelName}</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight" style={{ color: currentHeading }}>Főcím Színe</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: `${currentHeading}aa` }}>Ez a leírások színe.</p>
            </div>
            <div className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBg }}>Gomb és Kiemelés</div>
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";

// Az inspirációs Pinterest / Behance képek alapján újragondolt luxus paletta-mátrix
export const BRANDING_PRESETS = {
  obsidian_platinum: { name: "Obsidian Platinum (Mérnöki)", bg: "#0A0B0F", heading: "#E5E7EB", body: "#8B8D98", accent: "#8B8D98" },
  royal_gold: { name: "Royal Navy & Gold (Luxus)", bg: "#060B16", heading: "#E2D1B3", body: "#A2B3C6", accent: "#C6A675" },
  creme_burgundy: { name: "Creme & Deep Burgundy", bg: "#F4EFEA", heading: "#4A0E17", body: "#7A6865", accent: "#A11A4B" },
  cyber_neon: { name: "Cyberpunk Tech (Élénk)", bg: "#07040F", heading: "#00FFCC", body: "#EEA0FF", accent: "#5A4EFF" },
  swiss_emerald: { name: "Swiss Green (Letisztult)", bg: "#061310", heading: "#E2F4F0", body: "#789A93", accent: "#22C55E" },
  sandstone_cosy: { name: "Sandstone Beige (Meleg)", bg: "#151210", heading: "#E7CFA4", body: "#A19284", accent: "#C19A6B" },
  arctic_white: { name: "Arctic Minimal (Világos)", bg: "#F8FAFC", heading: "#0F172A", body: "#64748B", accent: "#06B6D4" },
  burnt_peach: { name: "Burnt Peach & Sage", bg: "#1A1512", heading: "#F4A27E", body: "#9FB1A5", accent: "#E67E22" },
  inkwell_eclipse: { name: "Inkwell Dark Chrome", bg: "#121318", heading: "#FFFFFF", body: "#71717A", accent: "#E2E8F0" },
  forest_heritage: { name: "Forest Prestige", bg: "#0B140F", heading: "#D1E7DD", body: "#748E81", accent: "#81C784" },
  monetto_flat: { name: "Monetto Terracotta", bg: "#FDFBF7", heading: "#EA2E00", body: "#5A6E72", accent: "#9DBDB8" },
  graphite_monochrome: { name: "Graphite Studio", bg: "#09090B", heading: "#FFFFFF", body: "#71717A", accent: "#FFFFFF" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "obsidian_platinum");

  // Globális Háttér és Gomb színek Custom módban
  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");

  // HÁROM KÜLÖNÁLLÓ BETŰSZÍN ÁLLAPOT CUSTOM MÓDBAN
  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");
  const [customBody, setCustomBody] = useState(settings.text_body_color || "#A1A1AA");
  const [customCardText, setCustomCardText] = useState(settings.text_card_color || "#FFFFFF");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  // Dashboard widgetek állapota
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

  // Előnézet aktuális színeinek kiszámítása
  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.obsidian_platinum;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;
  const currentBody = themeMode === "preset" ? pData.body : customBody;
  const currentCardText = themeMode === "preset" ? pData.heading : customCardText;

  // 🔒 AI Kontraszt-Lock (Megvédi a főcím szöveget a háttérbe olvadástól)
  const checkContrastValid = (bgHex: string, textHex: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return { r: parseInt(h.substr(0, 2), 16) || 0, g: parseInt(h.substr(2, 2), 16) || 0, b: parseInt(h.substr(4, 2), 16) || 0 };
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
        <p className="text-zinc-500 text-xs mt-1">Személyre szabott 3-szintű tipográfia és luxus inspirációjú vizuális paletták.</p>
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
          fd.set("text_body_color", currentBody);
          fd.set("text_card_color", currentCardText);

          Object.entries(widgets).forEach(([k, v]) => fd.set(`widget_${k}`, String(v)));

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden arculati elem és egyedi betűszín sikeresen szinkronizálva lett!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL OSZLOP: MENÜ */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          <span className="text-[9px] uppercase font-bold text-zinc-600 px-3 py-1 block">Rendszerbeállítások</span>
          {subTabs.map((t) => (
            <button
              key={t.id} type="button" onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:bg-zinc-900/40'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* KÖZÉPSŐ OSZLOP: KONFIGURÁTOR */}
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
                    <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Színpaletták & 3-Szintű Betűszín Választó</h3>
                
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'preset' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>12 Újragondolt Preset</button>
                  <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'custom' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>Haladó Custom Builder</button>
                </div>

                {themeMode === "preset" && (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {Object.entries(BRANDING_PRESETS).map(([key, p]) => (
                      <button
                        key={key} type="button" onClick={() => setSelectedPreset(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? 'border-zinc-400 bg-zinc-900' : 'border-zinc-900 bg-black/40'}`}
                      >
                        <span className="font-bold text-white mb-2 text-[10px] truncate">{p.name}</span>
                        <div className="flex gap-1 h-3 w-full rounded overflow-hidden bg-zinc-950 p-0.5 border border-zinc-900">
                          <div className="w-3 rounded-sm" style={{ backgroundColor: p.bg }} title="Háttér" />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.heading }} title="Címek" />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.accent }} title="Gombok" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {themeMode === "custom" && (
                  <div className="p-4 bg-black rounded-xl border border-zinc-900 space-y-4">
                    <h4 className="text-[10px] uppercase font-bold text-zinc-500">🧱 Blokkok Alapszínei</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Háttérszín (Base)</label>
                        <div className="flex gap-2"><input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent" /><input type="text" value={customBg} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-center font-mono" /></div>
                      </div>
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Gombok & Kiemelés (Accent)</label>
                        <div className="flex gap-2"><input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-8 h-8 rounded border-0 bg-transparent" /><input type="text" value={customAccent} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-center font-mono" /></div>
                      </div>
                    </div>

                    <h4 className="text-[10px] uppercase font-bold text-zinc-500 pt-2 border-t border-zinc-900">🔤 3-Szintű Betűszín Szabályzás</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-zinc-500 block text-[10px] mb-0.5">Főcímek színe</label>
                        <input type="color" value={customHeading} onChange={(e) => setCustomHeading(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
                      </div>
                      <div>
                        <label className="text-zinc-500 block text-[10px] mb-0.5">Leírások színe</label>
                        <input type="color" value={customBody} onChange={(e) => setCustomBody(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
                      </div>
                      <div>
                        <label className="text-zinc-500 block text-[10px] mb-0.5">Kártya betűszín</label>
                        <input type="color" value={customCardText} onChange={(e) => setCustomCardText(e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
                      </div>
                    </div>

                    {!isContrastValid && <div className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-[10px] font-bold">⚠️ AI Kontraszt-Lock: A háttér és a főcím betűszíne túl közel van egymáshoz!</div>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-500 block mb-1">Betűtípus</label>
                    <select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Cinzel">Cinzel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Ikonok stílusa</label>
                    <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="minimal">Letisztult minimal</option>
                      <option value="glass-box">Glass-box (Kontúros)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TABS 3: DASHBOARD */}
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

            {/* TABS 4: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🔔 Okos Értesítések & Telefonos Push</h3>
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-900 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer"><span className="text-zinc-300">🩸 Közelgő tüzelések és ciklusok</span><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600" /></label>
                  <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-zinc-900"><span className="text-zinc-300">💉 Esedékes Oltások & Határidők</span><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600" /></label>
                </div>
              </div>
            )}

            {/* TABS 5: AUTOMATIONS */}
            {activeTab === "automations" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-emerald-400 border-b border-zinc-900 pb-2">⚙️ Advanced Workflow & Automations</h3>
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-[11px]">
                  ✨ Az összes intelligens háttér-automatizmus (oltásértesítő, vemhességszámítás, Google Calendar export) aktív és be van építve a licencedbe!
                </div>
              </div>
            )}

          </div>

          <button 
            type="submit" 
            disabled={isPending || !isContrastValid} 
            className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4" 
            style={{ backgroundColor: isContrastValid ? currentAccent : "#27272a", color: isContrastValid ? currentBg : "#71717a" }}
          >
            {isPending ? "Konfiguráció mentése..." : "🚀 TELJES ARCULATI STRATÉGIA MENTÉSE"}
          </button>
        </div>

        {/* JOBB OSZLOP: VALÓS IDEJŰ DESIGN PREVIEW */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Valós Idejű Előnézet</span>
          <div 
            className="border rounded-2xl shadow-2xl p-5 space-y-5 transition-all duration-300"
            style={{ backgroundColor: currentBg, borderColor: `${currentHeading}15`, fontFamily: `'${fontName}', sans-serif` }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${currentHeading}10` }}>
              <span className="font-bold text-xs" style={{ color: currentHeading }}>🐾 {kennelName}</span>
              <span className="text-[10px]" style={{ color: currentBody }}>Preview Mode</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight" style={{ color: currentHeading }}>Főcím Teszt</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: currentBody }}>Ez a leírások és magyarázó szövegek betűszíne.</p>
            </div>

            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: `${currentHeading}06`, borderColor: `${currentHeading}10` }}>
              <span style={{ color: currentCardText }} className="font-bold">Kártya betűszín teszt</span>
              <span className="font-black text-xs" style={{ color: currentAccent }}>#OK</span>
            </div>

            <button type="button" className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBg }}>
              Gomb Előnézet
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

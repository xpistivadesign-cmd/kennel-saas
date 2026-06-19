"use client";

import { useState, useTransition } from "react";

// Az új inspirációs képek alapján prémium szintre finomhangolt luxus paletta-mátrix
export const BRANDING_PRESETS = {
  obsidian_platinum: { name: "Obsidian Platinum (Mérnöki)", bg: "#0D0E12", heading: "#F3F4F6", body: "#9CA3AF", accent: "#9CA3AF" },
  royal_gold: { name: "Royal Navy & Gold (Luxus)", bg: "#0A1128", heading: "#F4E4C1", body: "#94A3B8", accent: "#D4AF37" },
  creme_burgundy: { name: "Creme & Deep Burgundy", bg: "#FAF6F0", heading: "#3B0A11", body: "#6B5A58", accent: "#801020" },
  cyber_neon: { name: "Cyberpunk Tech (Élénk)", bg: "#080511", heading: "#00FFCC", body: "#E0A0FF", accent: "#6366F1" },
  swiss_emerald: { name: "Swiss Green (Letisztult)", bg: "#081612", heading: "#E6F7F4", body: "#80A199", accent: "#10B981" },
  sandstone_cosy: { name: "Sandstone Beige (Meleg)", bg: "#1C1816", heading: "#EED6B3", body: "#A89A8D", accent: "#CDA275" },
  arctic_white: { name: "Arctic Minimal (Világos)", bg: "#F8FAFC", heading: "#0F172A", body: "#475569", accent: "#0EA5E9" },
  burnt_peach: { name: "Burnt Peach & Sage", bg: "#1F1916", heading: "#FBBF24", body: "#A7F3D0", accent: "#F59E0B" },
  inkwell_eclipse: { name: "Inkwell Dark Chrome", bg: "#111217", heading: "#FFFFFF", body: "#94949E", accent: "#F1F5F9" },
  forest_heritage: { name: "Forest Prestige", bg: "#0C1712", heading: "#D1E7DD", body: "#829E90", accent: "#4ADE80" },
  monetto_flat: { name: "Warm Terracotta Studio", bg: "#FCFAF7", heading: "#C2410C", body: "#4B5563", accent: "#2DD4BF" },
  graphite_monochrome: { name: "Graphite Studio", bg: "#09090B", heading: "#FFFFFF", body: "#A1A1AA", accent: "#FFFFFF" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "obsidian_platinum");

  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");

  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");
  const [customBody, setCustomBody] = useState(settings.text_body_color || "#A1A1AA");
  const [customCardText, setCustomCardText] = useState(settings.text_card_color || "#FFFFFF");

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

  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.obsidian_platinum;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;
  const currentBody = themeMode === "preset" ? pData.body : customBody;
  const currentCardText = themeMode === "preset" ? pData.heading : customCardText;

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
            alert("Minden konfiguráció, fájl és dokumentum adat sikeresen elmentve!");
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
                    <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500">📄 Szerződés & PDF Export Törzsadatok</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tenyésztő Neve" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                    <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Székhely Cím" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                    <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* TABS 2: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Színpaletták & 3-Szintű Betűszín Választó</h3>
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'preset' ? 'bg-zinc-900 text-

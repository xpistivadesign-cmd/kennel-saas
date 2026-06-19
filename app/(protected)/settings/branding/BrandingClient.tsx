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

  // 🔒 AI Kontraszt-Lock függvény tűpontos lezárásokkal
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
                    <input type="file" name

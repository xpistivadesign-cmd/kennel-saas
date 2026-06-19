"use client";

import { useState, useTransition } from "react";

// 12 DARAB PRÉMIUM SÉMA (6 kép alapú Pinterest séma + 6 kiegészítő luxus variáció)
export const BRANDING_PRESETS = {
  deep_burgundy: { name: "Mély Burgundi & Krém", bg: "#0E0D0D", heading: "#EEDCC1", body: "#A89A8D", card: "#EEDCC1", btnText: "#FFFFFF", accent: "#5E001A" },
  royal_navy: { name: "Navy & Elegáns Arany", bg: "#1F2A44", heading: "#E8DCC8", body: "#94A3B8", card: "#E8DCC8", btnText: "#000000", accent: "#C6A75E" },
  cyber_neon: { name: "Cyberpunk Kék & Lila", bg: "#0E48C1", heading: "#3DF8F8", body: "#E0A0FF", card: "#3DF8F8", btnText: "#FFFFFF", accent: "#E23AFB" },
  neon_lime: { name: "High-Tech Sötét & Lime", bg: "#111217", heading: "#FEFFFC", body: "#94949E", card: "#FEFFFC", btnText: "#000000", accent: "#DDFF00" },
  behance_pastel: { name: "Behance Pasztell Mályva", bg: "#F5F5F5", heading: "#5A4EFF", body: "#4B5563", card: "#5A4EFF", btnText: "#FFFFFF", accent: "#EEA0FF" },
  travel_app: { name: "Travel App Mint (Világos)", bg: "#F5F5F5", heading: "#1F2937", body: "#6B7280", card: "#1F2937", btnText: "#000000", accent: "#E2F4A6" },
  royal_gold_dark: { name: "Royal Gold (Luxus)", bg: "#09090B", heading: "#D4A45A", body: "#A1A1AA", card: "#D4A45A", btnText: "#000000", accent: "#F4D58D" },
  imperial_purple: { name: "Imperial Purple", bg: "#0E081A", heading: "#C084FC", body: "#A78BFA", card: "#C084FC", btnText: "#FFFFFF", accent: "#7C3AED" },
  bordeaux_velvet: { name: "Bordeaux Velvet", bg: "#14070B", heading: "#F472B6", body: "#FDA4AF", card: "#F472B6", btnText: "#FFFFFF", accent: "#A11A4B" },
  forest_elite: { name: "Forest Prestige", bg: "#07100A", heading: "#81C784", body: "#A7F3D0", card: "#81C784", btnText: "#FFFFFF", accent: "#2E7D32" },
  sandstone_luxury: { name: "Sandstone Classic", bg: "#12100D", heading: "#E7CFA4", body: "#D1B894", card: "#E7CFA4", btnText: "#000000", accent: "#C19A6B" },
  graphite_monochrome: { name: "Graphite Minimal Studio", bg: "#09090B", heading: "#FFFFFF", body: "#71717A", card: "#FFFFFF", btnText: "#000000", accent: "#FFFFFF" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "deep_burgundy");

  // Custom Szín állapotok (Mind az 5 csatorna külön vezérelhető!)
  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");
  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#FFFFFF");
  const [customBody, setCustomBody] = useState(settings.text_body_color || "#A1A1AA");
  const [customCardText, setCustomCardText] = useState(settings.text_card_color || "#FFFFFF");
  const [customBtnText, setCustomBtnText] = useState(settings.text_btn_color || "#000000");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  // Dashboard widgetek állapota
  const [widgets, setWidgets] = useState({
    dogs: settings.widget_dogs !== false,
    heats: settings.widget_heats !== false,
    litters: settings.widget_litters !== false,
    finance: settings.widget_finance !== false,
    shows: settings.widget_shows !== false,
    calendar: settings.widget_calendar !== false
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
  };

  // Aktuálisan érvényes színek kiszámítása az Előnézethez
  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.deep_burgundy;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;
  const currentHeading = themeMode === "preset" ? pData.heading : customHeading;
  const currentBody = themeMode === "preset" ? pData.body : customBody;
  const currentCardText = themeMode === "preset" ? pData.card : customCardText;
  const currentBtnText = themeMode === "preset" ? pData.btnText : customBtnText;

  const checkContrastValid = (bgHex: string, textHex: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return { r: parseInt(h.substr(0, 2), 16) || 0, g: parseInt(h.substr(2, 2), 16) || 0, b: parseInt(h.substr(4, 2), 16) || 0 };
    };
    const c1 = getRGB(bgHex); const c2 = getRGB(textHex);
    const yiq1 = ((c1.r * 299) + (c1.g * 587) + (c1.b * 114)) / 1000;
    const yiq2 = ((c2.r * 299) + (c2.g * 587) + (c2.b * 114)) / 1000;
    return Math.abs(yiq1 - yiq2) > 40; 
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
        <p className="text-zinc-500 text-xs mt-1">Személyre szabott 5-szintű white-label konfiguráció és intelligens automatizmusok.</p>
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
          fd.set("text_btn_color", currentBtnText);

          Object.entries(widgets).forEach(([k, v]) => fd.set(`widget_${k}`, String(v)));

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden arculati elem, white-label adat és widget elrendezés sikeresen mentve!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL OSZLOP MENÜ */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          <span className="text-[9px] uppercase font-bold text-zinc-600 px-3 py-1 block">Rendszerbeállítások</span>
          {subTabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/40"}`}>{t.label}</button>
          ))}
        </div>

        {/* KÖZÉPSŐ PANEL */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl min-h-[500px] flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* 1. MY KENNEL BRANDING FÜL */}
            {activeTab === "my-kennel" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-900 pb-2">🏢 Kennel Alapadatok & White-Label</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Kennel Hivatalos Neve</label>
                    <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white shadow-inner" />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Logó Feltöltése</label>
                    <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-500 cursor-pointer" />
                    <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-400 border-t border-zinc-900/60 pt-3">📄 Szerződés & Hivatalos PDF Export Törzsadatok</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-zinc-500 block mb-0.5">Tenyésztő Hivatalos Neve</label>
                      <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="pl. Kovács János" className="bg-black border border-zinc-900尊 rounded-lg p-2 w-full text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Székhely Címe</label>
                        <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="pl. 1051 Budapest, Petőfi u. 1." className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                      </div>
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Adószám / Cégjegyzékszám</label>
                        <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="pl. 12345678-1-42" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPEARANCE FÜL (MIND A 12 SÉMA + 11 BETŰTÍPUS + 3 IKONSTÍLUS) */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Színpaletták & Haladó Tipográfia</h3>
                
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === "preset" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>12 Kép Alapú Preset</button>
                  <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === "custom" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>Haladó Custom Builder</button>
                </div>

                {themeMode === "preset" && (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {Object.entries(BRANDING_PRESETS).map(([key, p]) => (
                      <button key={key} type="button" onClick={() => setSelectedPreset(key)} className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? "border-zinc-400 bg-zinc-900" : "border-zinc-900 bg-black/40"}`}>
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
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Háttérszín (Base)</label><input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Gombok / Kiemelés (Accent)</label><input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-900/60">
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Főcímek</label><input type="color" value={customHeading} onChange={(e) => setCustomHeading(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Leírások</label><input type="color" value={customBody} onChange={(e) => setCustomBody(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Kártyák</label><input type="color" value={customCardText} onChange={(e) => setCustomCardText(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Gomb Betű</label><input type="color" value={customBtnText} onChange={(e) => setCustomBtnText(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                    </div>
                    {!isContrastValid && <div className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-[10px] font-bold">⚠️ AI Kontraszt-Lock aktív!</div>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-zinc-500 block mb-1">Betűtípus (11 prémium stílus)</label>
                    <select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="Inter">Inter (Letisztult modern)</option>
                      <option value="Poppins">Poppins (Geometrikus tech)</option>
                      <option value="Cinzel">Cinzel (Klasszikus luxus)</option>
                      <option value="Montserrat">Montserrat (Prémium sans)</option>
                      <option value="Playfair Display">Playfair Display (Elegáns serif)</option>
                      <option value="Roboto">Roboto (Klasszikus gyári)</option>
                      <option value="Oswald">Oswald (Karakteres vastag)</option>
                      <option value="Lora">Lora (Finom szerkesztőségi)</option>
                      <option value="Ubuntu">Ubuntu (Lágy kerekített)</option>
                      <option value="Merriweather">Merriweather (Olvasható serif)</option>
                      <option value="Caveat">Caveat (Egyedi kézírásos)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Ikonok vizuális stílusa</label>
                    <select name="icon_style" defaultValue={settings.icon_style || "glass-box"} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="minimal">Letisztult sík minimalizmus</option>
                      <option value="glass-box">Glass-Box (Prémium kontúros)</option>
                      <option value="duotone-neon">Duotone Glow (Neon izzás)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DASHBOARD LAYOUT FÜL */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-900 pb-2">🖥️ Munkaterület Módok & Dashboard Elrendezés</h3>
                <p className="text-zinc-500 text-[11px]">Válts át egy kattintással az előre kalibrált cél-workspace-ekre, vagy szabd személyre a widgetek láthatóságát.</p>
                
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => applyWorkspacePreset("all")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🌟 All Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("breeding")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🍼 Breeding</button>
                  <button type="button" onClick={() => applyWorkspacePreset("show")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🏆 Show Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("finance")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">💰 Finance</button>
                </div>

                <h4 className="text-[10px] uppercase font-bold text-zinc-500 pt-3 border-t border-zinc-900">Aktív Dashboard Blokkok Szűrése</h4>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-4 rounded-xl border border-zinc-900">
                  {Object.entries(widgets).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2.5 p-1.5 cursor-pointer capitalize hover:opacity-80">
                      <input 
                        type="checkbox" checked={v} 
                        onChange={(e) => setWidgets({ ...widgets, [k]: e.target.checked })} 
                        className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" 
                      />
                      <span className="font-medium text-zinc-300">{k === "dogs" ? "🐕 Kutyák listája" : k === "heats" ? "🩸 Ciklusok & Tüzelések" : k === "litters" ? "🐾 Almok menedzsmentje" : k === "finance" ? "💰 Pénzügyi Widget" : k === "shows" ? "🏆 Kiállítási naptár" : "📅 Google Kalendárium"}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS & ALERTS FÜL */}
            {activeTab === "notifications" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🔔 Okos Értesítések & Telefonos Push Figyelmeztetések</h3>
                <p className="text-zinc-500 text-[11px]">Állítsd be, hogy mely események közeledtekor küldjön a szoftver azonnali emlékeztető push üzenetet a telefonod kijelzőjére.</p>

                <div className="space-y-2 bg-black/40 p-4 rounded-xl border border-zinc-900">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">🩸 Progeszteron & Ciklus Értesítések</h4>
                      <p className="text-zinc-500 text-[10px]">A tüzelés várható kezdete előtt 3 nappal riaszt a rendszer.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-blue-600 focus:ring-0" />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer border-t border-zinc-900/60 pt-2">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">💉 Kötelező Oltások és Féregtelenítések</h4>
                      <p className="text-zinc-500 text-[10px]">A kölykök és felnőtt állatok egészségügyi határideje előtt 48 órával.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-blue-600 focus:ring-0" />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer border-t border-zinc-900/60 pt-2">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">🏆 Show Nevezési Határidők</h4>
                      <p className="text-zinc-500 text-[10px]">Figyelmeztetés a kedvezményes (1. és 2. körös) nevezési ablakok lejárta előtt.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-blue-600 focus:ring-0" />
                  </label>
                </div>
              </div>
            )}

            {/* 5. AUTOMATIONS FÜL */}
            {activeTab === "automations" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-emerald-400 border-b border-zinc-900 pb-2">⚙️ Advanced Workflow & Automations</h3>
                <p className="text-zinc-500 text-[11px]">A licencdíjad részét képező, háttérben futó automatizációs motor állapota.</p>
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-[11px] font-medium">
                  ✨ Mivel a szoftver teljes értékű verzióját birtokolod, a Vemhességi naptár szinkronizáció Google Calendar-ral és az automatikus egészségügyi kalkulációk a háttérben folyamatosan futnak!
                </div>
              </div>
            )}

          </div>

          {/* MENTÉS GOMB */}
          <button type="submit" disabled={isPending || !isContrastValid} className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all mt-4" style={{ backgroundColor: isContrastValid ? currentAccent : "#27272a", color: isContrastValid ? currentBtnText : "#71717a" }}>
            {isPending ? "Mentés folyamatban..." : "🚀 ARCULAT ÉS ADATOK MENTÉSE"}
          </button>
        </div>

        {/* JOBB OSZLOP: ZÁRT ÉS STABIL ELŐNÉZET */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Élő Előnézet</span>
          <div className="border rounded-2xl shadow-2xl p-5 space-y-5 transition-all duration-300" style={{ backgroundColor: currentBg, borderColor: `${currentHeading}15`, fontFamily: `'${fontName}', sans-serif` }}>
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${currentHeading}10` }}>
              <span className="font-bold text-xs" style={{ color: currentHeading }}>🐾 {kennelName}</span>
              <span className="text-[10px]" style={{ color: currentBody }}>Preview Mode</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight" style={{ color: currentHeading }}>Főcím Színe</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: currentBody }}>Ez a leírások és magyarázó szövegek betűszíne a felületen.</p>
            </div>
            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: `${currentHeading}06`, borderColor: `${currentHeading}10` }}>
              <span style={{ color: currentCardText }} className="font-bold">Kártya betűszín teszt</span>
            </div>
            <button type="button" className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBtnText }}>Gomb Előnézet</button>
          </div>
        </div>
      </form>
    </div>
  );
}

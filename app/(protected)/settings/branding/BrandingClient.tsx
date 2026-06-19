"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  graphite_monochrome: { name: "Graphite Studio", bg: "#09090B", heading: "#FFFFFF", body: "#71717A", card: "#FFFFFF", btnText: "#000000", accent: "#FFFFFF" },
};

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "deep_burgundy");

  const [customBg, setCustomBg] = useState(settings.bg_color || "#0E0D0D");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#5E001A");
  const [customHeading, setCustomHeading] = useState(settings.text_heading_color || "#EEDCC1");
  const [customBody, setCustomBody] = useState(settings.text_body_color || "#A89A8D");
  const [customCardText, setCustomCardText] = useState(settings.text_card_color || "#EEDCC1");
  const [customBtnText, setCustomBtnText] = useState(settings.text_btn_color || "#FFFFFF");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  const [widgets, setWidgets] = useState({
    dogs: settings.widget_dogs !== false,
    heats: settings.widget_heats !== false,
    litters: settings.widget_litters !== false,
    finance: settings.widget_finance !== false,
    shows: settings.widget_shows !== false,
    calendar: settings.widget_calendar !== false
  });

  const selectPresetHandler = (key: string) => {
    setSelectedPreset(key);
    const p = BRANDING_PRESETS[key as keyof typeof BRANDING_PRESETS];
    if (p) {
      setCustomBg(p.bg);
      setCustomAccent(p.accent);
      setCustomHeading(p.heading);
      setCustomBody(p.body);
      setCustomCardText(p.card);
      setCustomBtnText(p.btnText);
    }
  };

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

  const currentBg = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.bg : customBg;
  const currentAccent = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.accent : customAccent;
  const currentHeading = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.heading : customHeading;
  const currentBody = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.body : customBody;
  const currentCardText = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.card : customCardText;
  const currentBtnText = themeMode === "preset" ? BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS]?.btnText : customBtnText;

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
        <p className="text-zinc-500 text-xs mt-1">Személyre szabott white-label beállítások és intelligens arculatvezérlés.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("theme_mode", themeMode);
          fd.set("preset_palette", selectedPreset);
          fd.set("bg_color", currentBg || "");
          fd.set("accent_color", currentAccent || "");
          fd.set("text_heading_color", currentHeading || "");
          fd.set("text_body_color", currentBody || "");
          fd.set("text_card_color", currentCardText || "");
          fd.set("text_btn_color", currentBtnText || "");

          Object.entries(widgets).forEach(([k, v]) => fd.set(`widget_${k}`, String(v)));

          startTransition(async () => {
            await saveBrandingAction(fd);
            router.refresh();
            window.location.reload();
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL OSZLOP MENÜ */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          {subTabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/40"}`}>{t.label}</button>
          ))}
        </div>

        {/* KÖZÉPSŐ PANEL */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl min-h-[460px] flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* 1. MY KENNEL TAB */}
            {activeTab === "my-kennel" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-900 pb-2">🏢 Kennel Alapadatok & White-Label</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Kennel Hivatalos Neve</label>
                    <input type="text" name="kennel_name" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white" />
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1 font-bold">Logó Feltöltése</label>
                    <input type="file" name="logo_file" accept="image/*" className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-zinc-500 cursor-pointer" />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500 border-t border-zinc-900/50 pt-3">📄 Szerződés & Törzsadatok</h4>
                  <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tenyésztő Neve" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                  <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Székhely Cím" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                  <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 w-full text-white" />
                </div>
              </div>
            )}

            {/* 2. APPEARANCE TAB */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Színpaletták & Haladó Tipográfia</h3>
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === "preset" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>12 Kép Alapú Preset</button>
                  <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === "custom" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}>Custom Builder</button>
                </div>

                {themeMode === "preset" && (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {Object.entries(BRANDING_PRESETS).map(([key, p]) => (
                      <button key={key} type="button" onClick={() => selectPresetHandler(key)} className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${selectedPreset === key ? "border-zinc-400 bg-zinc-900" : "border-zinc-900 bg-black/40"}`}>
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
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Háttér</label><input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[10px] mb-0.5">Accent (Gomb)</label><input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-900">
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Főcímek</label><input type="color" value={customHeading} onChange={(e) => setCustomHeading(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Leírások</label><input type="color" value={customBody} onChange={(e) => setCustomBody(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Kártyák</label><input type="color" value={customCardText} onChange={(e) => setCustomCardText(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                      <div><label className="text-zinc-500 block text-[9px] mb-0.5">Gomb Betű</label><input type="color" value={customBtnText} onChange={(e) => setCustomBtnText(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-zinc-500 block mb-1">Betűtípus (11 prémium stílus)</label>
                  <select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                    <option value="Inter">Inter (Modern letisztult)</option>
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
              </div>
            )}

            {/* 3. DASHBOARD LAYOUT TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-900 pb-2">🖥️ Dashboard Blokkok Menedzsmentje</h3>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button type="button" onClick={() => applyWorkspacePreset("all")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🌟 All Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("breeding")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🍼 Breeding</button>
                  <button type="button" onClick={() => applyWorkspacePreset("show")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">🏆 Show Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("finance")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-[10px] hover:border-zinc-700">💰 Finance</button>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-4 rounded-xl border border-zinc-900">
                  {Object.entries(widgets).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2.5 p-1.5 cursor-pointer capitalize">
                      <input type="checkbox" checked={v} onChange={(e) => setWidgets({ ...widgets, [k]: e.target.checked })} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                      <span className="text-zinc-300">{k} blokk láthatósága</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🔔 Rendszer Értesítések & Push Riasztások</h3>
                <div className="p-4 bg-black/40 rounded-xl border border-zinc-900 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-white/5"><span className="text-zinc-300">🩸 Közelgő ciklusok push riasztása</span><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600" /></label>
                  <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-white/5 border-t border-zinc-900 pt-2"><span className="text-zinc-300">💉 Kötelező oltások emlékeztetője</span><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600" /></label>
                  <label className="flex items-center justify-between cursor-pointer p-1 rounded hover:bg-white/5 border-t border-zinc-900 pt-2"><span className="text-zinc-300">🏆 Kiállítási nevezési határidők</span><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600" /></label>
                </div>
              </div>
            )}

            {/* 5. AUTOMATIONS TAB */}
            {activeTab === "automations" && <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl">✨ Minden háttér-automatizmus élesítve van és fut a licencében.</div>}
          </div>

          <button type="submit" disabled={isPending} className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all mt-4" style={{ backgroundColor: currentAccent, color: currentBtnText }}>
            {isPending ? "Mentés..." : "🚀 ARCULAT ÉS ADATOK VÉGREGESÍTÉSE"}
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
              <p className="text-[11px] leading-relaxed" style={{ color: currentBody }}>Ez a leírások szövegszíne.</p>
            </div>
            <button type="button" className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBtnText }}>Gomb Színe</button>
          </div>
        </div>
      </form>
    </div>
  );
}

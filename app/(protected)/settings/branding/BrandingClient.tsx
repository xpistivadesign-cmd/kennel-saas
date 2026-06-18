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
  
  // Fő beállítások fülek állapota
  const [activeTab, setActiveTab] = useState("my-kennel");

  const [themeMode, setThemeMode] = useState(settings.theme_mode || "preset");
  const [selectedPreset, setSelectedPreset] = useState(settings.preset_palette || "obsidian_platinum");

  // Custom picker állapotok
  const [customBg, setCustomBg] = useState(settings.bg_color || "#0A0B0F");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#8B8D98");
  const [customPrimary, setCustomPrimary] = useState("#E5E7EB");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");

  // Dashboard widgetek láthatósági állapota
  const [widgets, setWidgets] = useState({
    dogs: true, heats: true, litters: true, finance: true, shows: true, calendar: true
  });

  // Workspace módválasztó gombok logikája
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
    alert(`Workspace átváltva: ${mode.toUpperCase()} MODE. Ne felejtsd el elmenteni alul!`);
  };

  const pData = BRANDING_PRESETS[selectedPreset as keyof typeof BRANDING_PRESETS] || BRANDING_PRESETS.obsidian_platinum;
  const currentBg = themeMode === "preset" ? pData.bg : customBg;
  const currentPrimary = themeMode === "preset" ? pData.primary : customPrimary;
  const currentAccent = themeMode === "preset" ? pData.accent : customAccent;

  // AI Kontraszt-Lock ellenőrzés
  const checkContrastValid = (hex1: string, hex2: string) => {
    const getRGB = (c: string) => {
      const h = c.replace("#", "");
      return {
        r: parseInt(h.substr(0, 2), 16) || 0,
        g: parseInt(h.substr(2, 2), 16) || 0,
        b: parseInt(h.substr(4, 2), 16) || 0
      };
    };
    const c1 = getRGB(hex1); 
    const c2 = getRGB(hex2);
    const yiq1 = ((c1.r * 299) + (c1.g * 587) + (c1.b * 114)) / 1000;
    const yiq2 = ((c2.r * 299) + (c2.g * 587) + (c2.b * 114)) / 1000;
    return Math.abs(yiq1 - yiq2) > 45;
  };

  const isContrastValid = themeMode === "preset" ? true : checkContrastValid(customBg, customAccent);

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
        <h1 className="text-3xl font-black tracking-tight">🎛️ Control Panel / Settings</h1>
        <p className="text-zinc-500 text-xs mt-1">Saját márkás white-label konfiguráció, automatizmusok és workspace kezelés.</p>
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

          Object.entries(widgets).forEach(([k, v]) => fd.set(`widget_${k}`, String(v)));

          startTransition(async () => {
            await saveBrandingAction(fd);
            alert("Minden konfiguráció és prémium funkció sikeresen mentve!");
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL OSZLOP: ALMENÜ */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          <span className="text-[9px] uppercase font-bold text-zinc-600 px-3 py-1 block">Konfiguráció</span>
          {subTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? 'bg-zinc-900 text-white shadow' : 'text-zinc-400 hover:bg-zinc-900/40'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* KÖZÉPSŐ OSZLOP: AKTÍV TARTALOM */}
        <div className="lg:col-span-2 space-y-5 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl min-h-[440px] flex flex-col justify-between">
          <div className="space-y-5">
            
            {/* 1. FÜL: MY KENNEL */}
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
                    <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] uppercase font-bold text-zinc-500">📄 Szerződés & PDF Export Törzsadatok</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tenyésztő Neve" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
                    <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Székhely Cím" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
                    <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. FÜL: APPEARANCE */}
            {activeTab === "appearance" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Rendszer Téma & Tipográfia</h3>
                
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-zinc-900">
                  <button type="button" onClick={() => setThemeMode("preset")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'preset' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>12 Premium Preset</button>
                  <button type="button" onClick={() => setThemeMode("custom")} className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] ${themeMode === 'custom' ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>Theme Builder</button>
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
                          <div className="w-3 rounded-sm" style={{ backgroundColor: p.bg }} />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.primary }} />
                          <div className="flex-1 rounded-sm" style={{ backgroundColor: p.accent }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {themeMode === "custom" && (
                  <div className="p-3 bg-black rounded-xl border border-zinc-900 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Base (Bg)</label>
                        <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-8 rounded border-0 cursor-pointer bg-transparent" />
                      </div>
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Primary (Text)</label>
                        <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-full h-8 rounded border-0 cursor-pointer bg-transparent" />
                      </div>
                      <div>
                        <label className="text-zinc-500 block mb-0.5">Accent (Gomb)</label>
                        <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full h-8 rounded border-0 cursor-pointer bg-transparent" />
                      </div>
                    </div>
                    {!isContrastValid && <div className="p-2 bg-red-950/40 border border-red-900 text-red-400 rounded-lg text-[10px] font-bold">⚠️ Kontraszt-Lock aktív! Rossz olvashatóság.</div>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-zinc-500 block mb-1">Betűtípus</label>
                    <select name="google_font_name" value={fontName} onChange={(e) => setFontName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Cinzel">Cinzel</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">Ikon stílus</label>
                    <select name="icon_style" defaultValue={settings.icon_style} className="w-full bg-black border border-zinc-900 rounded-lg p-2 text-white">
                      <option value="minimal">Letisztult</option>
                      <option value="glass-box">Glass-box (Prémium)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FÜL: DASHBOARD LAYOUT */}
            {activeTab === "dashboard" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-900 pb-2">🚀 Workspace Presets</h3>
                
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => applyWorkspacePreset("all")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold hover:border-zinc-700 text-center text-[10px]">🌟 All Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("breeding")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold hover:border-zinc-700 text-center text-[10px]">🍼 Breeding</button>
                  <button type="button" onClick={() => applyWorkspacePreset("show")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold hover:border-zinc-700 text-center text-[10px]">🏆 Show Mode</button>
                  <button type="button" onClick={() => applyWorkspacePreset("finance")} className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl font-bold hover:border-zinc-700 text-center text-[10px]">💰 Finance</button>
                </div>

                <h4 className="text-xs font-bold text-zinc-400 pt-2 border-t border-zinc-900">☑️ Dashboard Widgetek kezelése</h4>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-4 rounded-xl border border-zinc-900">
                  {Object.entries(widgets).map(([k, v]) => (
                    <label key={k} className="flex items-center gap-2.5 p-1.5 cursor-pointer capitalize hover:opacity-80">
                      <input 
                        type="checkbox" 
                        checked={v} 
                        onChange={(e) => setWidgets({ ...widgets, [k]: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" 
                      />
                      <span className="font-medium text-zinc-300">{k === "heats" ? "🩸 Tüzelések (Heats)" : k === "litters" ? "🐾 Almok (Litters)" : k}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FÜL: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🔔 Okos Értesítések & Telefonos Push</h3>
                <p className="text-zinc-500 text-[11px]">Válaszd ki, hogy melyik kiemelt eseményekről szeretnél azonnali push értesítést kapni a mobiltelefonodra vagy a böngésződbe.</p>

                <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-zinc-900">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">🩸 Közelgő tüzelések és ciklusok</h4>
                      <p className="text-zinc-500 text-[10px]">A becsült progeszteron-csúcs és a tüzelés várható kezdete előtt 3 nappal.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer border-t border-zinc-900/60 pt-3">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">💉 Esedékes Oltások & Féregtelenítések</h4>
                      <p className="text-zinc-500 text-[10px]">Értesítés a kölykök és felnőtt kutyák kötelező egészségügyi határidőiről.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/40 cursor-pointer border-t border-zinc-900/60 pt-3">
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">🏆 Kiállítási Nevezési Határidők</h4>
                      <p className="text-zinc-500 text-[10px]">Figyelmeztetés, mielőtt lejárna a kedvezményes nevezési határidő a rögzített show-kra.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                  </label>
                </div>

                <div className="p-3 bg-blue-950/20 border border-blue-900/40 text-blue-400 rounded-xl text-[11px] font-medium flex items-center gap-2">
                  <span>💡</span>
                  <span>A push értesítések fogadásához engedélyezned kell az értesítéseket a telefonod böngészőjében, miután az alkalmazást kiraktad a kezdőképernyőre!</span>
                </div>
              </div>
            )}

            {/* 5. FÜL: AUTOMATIONS */}
            {activeTab === "automations" && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-sm font-bold text-emerald-400 border-b border-zinc-900 pb-2">⚙️ Advanced Workflow & Automations</h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
                    <span className="text-lg">💉</span>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">Automata Egészségügyi Értesítések</h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5">A kutyák korából és az utolsó bejegyzésekből a rendszer automatikusan számolja a következő esedékes oltásokat és féregtelenítéseket.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">Vemhességi Naptár & Google Szinkron</h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Sikeres pároztatás rögzítésekor a szoftver legenerálja a 63 napos vemhességi mérföldköveket, és felmásolja a külső naptáradba.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-xl flex items-start gap-3">
                    <span className="text-lg">👥</span>
                    <div>
                      <h4 className="font-bold text-zinc-200 text-xs">Több-felhasználós (Team) Jogosultságok</h4>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Segítők, társtulajdonosok vagy alkalmazottak meghívása egyedi szerepkörökkel (pl. a gondozó láthatja a kutyákat, de a Pénzügy fület nem).</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 rounded-xl text-[11px] font-medium flex items-center gap-2">
                  <span>✨</span>
                  <span>Mivel Te a teljes rendszert megvásároltad, ezek az intelligens háttér-automatizmusok a háttérben alapértelmezetten futnak és segítik a mindennapi munkádat!</span>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isPending || !isContrastValid} 
            className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-4" 
            style={{ backgroundColor: isContrastValid ? currentAccent : "#27272a", color: "#000000" }}
          >
            {isPending ? "Beállítások mentése..." : "🚀 Minden beállítás mentése"}
          </button>
        </div>

        {/* JOBB OSZLOP: VALÓS IDEJŰ ELŐNÉZET */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Élő Előnézet</span>
          <div 
            className="border rounded-2xl shadow-2xl p-5 space-y-5 transition-all duration-300"
            style={{ backgroundColor: currentBg, borderColor: `${currentPrimary}15`, fontFamily: `'${fontName}', sans-serif` }}
          >
            <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: `${currentPrimary}10` }}>
              <span className="font-bold text-xs" style={{ color: currentPrimary }}>🐾 {kennelName}</span>
              <span className="text-[10px] opacity-60" style={{ color: currentPrimary }}>Preview Mode</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black tracking-tight" style={{ color: currentPrimary }}>Dizájn Ellenőrzés</h3>
              <p className="text-[11px] leading-relaxed opacity-75" style={{ color: currentPrimary }}>Szigorú, 3 színre korlátozott minimalista arculat a maximális elegancia érdekében.</p>
            </div>

            <div className="p-3 rounded-xl border flex justify-between items-center" style={{ backgroundColor: `${currentPrimary}04`, borderColor: `${currentPrimary}08` }}>
              <span style={{ color: currentPrimary }} className="font-bold">Kártya Előnézet</span>
              <span className="font-black text-xs" style={{ color: currentAccent }}>Szuper Kontraszt</span>
            </div>

            <button type="button" className="w-full text-center py-2.5 rounded-xl font-bold text-xs" style={{ backgroundColor: currentAccent, color: currentBg }}>
              Gomb Teszt
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

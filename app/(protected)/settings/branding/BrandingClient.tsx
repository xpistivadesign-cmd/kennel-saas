"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  // Alap módválasztó: dark, light, custom
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark");

  // Custom színek & UI paraméterek állapota
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color || "#7D39EB");
  const [accentColor, setAccentColor] = useState(settings.accent_color || "#C6FF33");
  const [bgColor, setBgColor] = useState(settings.bg_color || "#000000");
  const [cardColor, setCardColor] = useState(settings.card_color || "rgba(125, 57, 235, 0.06)");
  const [successColor, setSuccessColor] = useState(settings.success_color || "#10B981");
  const [warningColor, setWarningColor] = useState(settings.warning_color || "#F59E0B");
  const [dangerColor, setDangerColor] = useState(settings.danger_color || "#EF4444");
  
  const [uiRadius, setUiRadius] = useState(settings.ui_radius || 12);
  const [uiShadow, setUiShadow] = useState(settings.ui_shadow || "0 4px 20px rgba(0,0,0,0.5)");
  const [uiGlass, setUiGlass] = useState(settings.ui_glass_intensity || 4);

  // Kapcsolók (Feature Flags)
  const [featGradient, setFeatGradient] = useState(settings.feat_gradient === true);
  const [featGlass, setFeatGlass] = useState(settings.feat_glass === true);
  const [featNeon, setFeatNeon] = useState(settings.feat_neon !== false);
  const [featCompact, setFeatCompact] = useState(settings.feat_compact === true);
  const [featContrast, setFeatContrast] = useState(settings.feat_contrast === true);

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  const subTabs = [
    { id: "my-kennel", label: "🏢 My Kennel (White-Label)" },
    { id: "appearance", label: "🎨 App Brand & Theme Control" },
  ];

  // Gyorsváltó a kép alapú brand sémákhoz
  const handleModeChange = (mode: string) => {
    setThemeMode(mode);
    if (mode === "dark") {
      setBgColor("#000000");
      setPrimaryColor("#7D39EB");
      setAccentColor("#C6FF33");
    } else if (mode === "light") {
      setBgColor("#FFFFFF");
      setPrimaryColor("#7D39EB");
      setAccentColor("#C6FF33");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white text-xs">
      <div className="border-b border-zinc-900 pb-4">
        <h1 className="text-3xl font-black tracking-tight">🎛️ App Brand Configuration</h1>
        <p className="text-zinc-500 text-xs mt-1">A kép alapján hangolt hivatalos márkaszínek és haladó téma-illesztő builder.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("theme_mode", themeMode);
          fd.set("primary_color", primaryColor);
          fd.set("accent_color", accentColor);
          fd.set("bg_color", bgColor);
          fd.set("card_color", cardColor);
          fd.set("success_color", successColor);
          fd.set("warning_color", warningColor);
          fd.set("danger_color", dangerColor);
          fd.set("ui_radius", String(uiRadius));
          fd.set("ui_shadow", uiShadow);
          fd.set("ui_glass_intensity", String(uiGlass));

          fd.set("feat_gradient", String(featGradient));
          fd.set("feat_glass", String(featGlass));
          fd.set("feat_neon", String(featNeon));
          fd.set("feat_compact", String(featCompact));
          fd.set("feat_contrast", String(featContrast));
          fd.set("kennel_name", kennelName);

          startTransition(async () => {
            await saveBrandingAction(fd);
            router.refresh();
            window.location.reload();
          });
        }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* BAL MENÜ */}
        <div className="flex flex-col gap-1 bg-black/40 p-2 rounded-2xl border border-zinc-900 h-fit">
          {subTabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === t.id ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/40"}`}>{t.label}</button>
          ))}
        </div>

        {/* BEÁLLÍTÁSOK KÖZÉPEN */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-6">
          
          {activeTab === "my-kennel" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-900 pb-2">🏢 Kennel Alapadatok</h3>
              <div>
                <label className="text-zinc-500 block mb-1 font-bold">Kennel Megjelenítési Neve</label>
                <input type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tenyésztő Neve" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
                <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Székhely" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
                <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* BRAND MÓDVÁLASZTÓ DOBOZOK */}
              <div>
                <label className="text-zinc-500 block mb-2 font-bold uppercase tracking-wider text-[10px]">Hivatalos App Brand Módok</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => handleModeChange("dark")} className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${themeMode === "dark" ? "border-purple-500 bg-zinc-900" : "border-zinc-900 bg-black"}`}>
                    <div className="font-bold text-xs mb-1">⚫ Midnight Neon (Dark)</div>
                    <div className="text-[10px] text-zinc-500">Kép alapú prémium sötét mód violet és lime színekkel.</div>
                    {themeMode === "dark" && <span className="absolute top-2 right-2 text-xs text-purple-400">●</span>}
                  </button>
                  <button type="button" onClick={() => handleModeChange("light")} className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${themeMode === "light" ? "border-purple-500 bg-zinc-900" : "border-zinc-900 bg-black"}`}>
                    <div className="font-bold text-xs mb-1">⚪ Midnight Neon (Light)</div>
                    <div className="text-[10px] text-zinc-500">Tiszta fehér háttér a GridsterGP arculati színeivel.</div>
                    {themeMode === "light" && <span className="absolute top-2 right-2 text-xs text-purple-400">●</span>}
                  </button>
                </div>
                <button type="button" onClick={() => setThemeMode("custom")} className={`w-full mt-2 p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${themeMode === "custom" ? "border-purple-500 bg-zinc-900 text-white" : "border-zinc-900 bg-black text-zinc-400"}`}>
                  ⚙️ Custom Theme (Haladó Egyedi Builder)
                </button>
              </div>

              {/* HALADÓ CUSTOM BUILDER PANEL */}
              {themeMode === "custom" && (
                <div className="p-4 bg-black rounded-xl border border-zinc-900 space-y-4 animate-slideDown">
                  <h4 className="text-[10px] uppercase font-bold text-purple-400">Színcsatornák testreszabása</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Primary (Violet)</label><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Accent (Lime)</label><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Background</label><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-8 rounded bg-transparent cursor-pointer" /></div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 border-t border-zinc-900/60 pt-3">
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Card Base</label><input type="color" value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Success</label><input type="color" value={successColor} onChange={(e) => setSuccessColor(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Warning</label><input type="color" value={warningColor} onChange={(e) => setWarningColor(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                    <div><label className="text-zinc-500 block text-[9px] mb-0.5">Danger</label><input type="color" value={dangerColor} onChange={(e) => setDangerColor(e.target.value)} className="w-full h-7 rounded bg-transparent cursor-pointer" /></div>
                  </div>

                  <h4 className="text-[10px] uppercase font-bold text-purple-400 pt-2 border-t border-zinc-900">Stílusjegyek & Intenzitás</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5"><span>Lekerekítések (Radius)</span><span>{uiRadius}px</span></div>
                      <input type="range" min="0" max="24" value={uiRadius} onChange={(e) => setUiRadius(Number(e.target.value))} className="w-full accent-purple-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5"><span>Glassmorphism elmosás (Blur)</span><span>{uiGlass}px</span></div>
                      <input type="range" min="0" max="20" value={uiGlass} onChange={(e) => setUiGlass(Number(e.target.value))} className="w-full accent-purple-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* INTEGRÁLT EXTRA STRATÉGIAI KAPCSOLÓK */}
              <div>
                <label className="text-zinc-500 block mb-2 font-bold uppercase tracking-wider text-[10px]">Arculati Hatásfokozók</label>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-zinc-900">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featGradient} onChange={(e) => setFeatGradient(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" /> <span className="text-zinc-300">☑ Gradient mode</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featGlass} onChange={(e) => setFeatGlass(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" /> <span className="text-zinc-300">☑ Glassmorphism</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featNeon} onChange={(e) => setFeatNeon(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" /> <span className="text-zinc-300">☑ Neon glow</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={featCompact} onChange={(e) => setFeatCompact(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" /> <span className="text-zinc-300">☑ Compact UI</span></label>
                  <label className="flex items-center gap-2 cursor-pointer col-span-2 border-t border-zinc-900/60 pt-2"><input type="checkbox" checked={featContrast} onChange={(e) => setFeatContrast(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" /> <span className="text-zinc-300">☑ High contrast mód</span></label>
                </div>
              </div>

            </div>
          )}

          <button type="submit" disabled={isPending} className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs bg-purple-600 text-white shadow-lg transition-all" style={{ backgroundColor: accentColor, color: "#000000" }}>
            {isPending ? "Rendszer frissítése..." : "🚀 TELJES STRATÉGIA ÉLESÍTÉSE"}
          </button>
        </div>

        {/* JOBB OSZLOP: VALÓS IDEJŰ PREVIEW */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Valós Idejű Live Preview</span>
          <div className="border p-5 space-y-4 transition-all duration-300" style={{ backgroundColor: bgColor, borderRadius: `${uiRadius}px`, borderColor: `${primaryColor}20` }}>
            <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: `${primaryColor}10` }}>
              <span className="font-black text-xs" style={{ color: themeMode === "light" ? "#000000" : "#FFFFFF" }}>🐾 {kennelName}</span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>Preview</span>
            </div>

            {/* Kártyák különböző árnyalatai demonstrálva */}
            <div className="space-y-2">
              <div className="p-3 border transition-all" style={{ borderRadius: `${uiRadius}px`, backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30` }}>
                <span className="font-bold text-[10px] block" style={{ color: primaryColor }}>1. sz. Kártya (Violet tónus)</span>
                <span className="text-[11px]" style={{ color: themeMode === "light" ? "#4B5563" : "#9CA3AF" }}>Dinamikus márka-árnyalat.</span>
              </div>
              <div className="p-3 border transition-all" style={{ borderRadius: `${uiRadius}px`, backgroundColor: `${accentColor}10`, borderColor: `${accentColor}25` }}>
                <span className="font-bold text-[10px] block" style={{ color: accentColor }}>2. sz. Kártya (Lime tónus)</span>
                <span className="text-[11px]" style={{ color: themeMode === "light" ? "#4B5563" : "#9CA3AF" }}>Alternatív árnyalat-mátrix.</span>
              </div>
            </div>

            <div className="w-full text-center py-2 rounded-xl font-black text-xs transition-all" style={{ backgroundColor: accentColor, color: "#000000", borderRadius: `${uiRadius}px`, boxShadow: featNeon ? `0 0 10px ${accentColor}50` : "none" }}>
              Gomb Előnézet
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

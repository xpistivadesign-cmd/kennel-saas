"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("my-kennel");

  // A kért 6 fő strukturális választóállapot
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark"); // dark, light, system
  const [presetPalette, setPresetPalette] = useState(settings.preset_palette || "midnight"); // midnight, aurora, emerald, royal, custom
  const [uiStyle, setUiStyle] = useState(settings.ui_style || "neon"); // flat, glass, neon
  const [uiRadius, setUiRadius] = useState(settings.ui_radius || "medium"); // sharp, medium, soft
  const [uiAnimation, setUiAnimation] = useState(settings.ui_animation || "normal"); // minimal, normal, dynamic
  const [uiDensity, setUiDensity] = useState(settings.ui_density || "balanced"); // compact, balanced, luxury

  // Custom színek, ha a téma "custom"
  const [customBg, setCustomBg] = useState(settings.bg_color || "#000000");
  const [customPrimary, setCustomPrimary] = useState(settings.primary_color || "#7D39EB");
  const [customAccent, setCustomAccent] = useState(settings.accent_color || "#C6FF33");
  const [customCard, setCustomCard] = useState(settings.card_color || "#090A0F");

  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  const subTabs = [
    { id: "my-kennel", label: "🏢 My Kennel (White-Label)" },
    { id: "appearance", label: "🎨 Appearance & Architecture" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-white text-xs">
      <div className="border-b border-zinc-900 pb-4">
        <h1 className="text-3xl font-black tracking-tight">🎛️ Architecture Control Panel</h1>
        <p className="text-zinc-500 text-xs mt-1">Token alapú központi témakezelés és white-label konfiguráció.</p>
      </div>

      <form 
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set("theme_mode", themeMode);
          fd.set("preset_palette", presetPalette);
          fd.set("ui_style", uiStyle);
          fd.set("ui_radius", uiRadius);
          fd.set("ui_animation", uiAnimation);
          fd.set("ui_density", uiDensity);

          fd.set("bg_color", customBg);
          fd.set("primary_color", customPrimary);
          fd.set("accent_color", customAccent);
          fd.set("card_color", customCard);
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

        {/* KÖZÉPSŐ PANEL */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-5">
          
          {activeTab === "my-kennel" && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-900 pb-2">🏢 Kennel Törzsadatok</h3>
              <div>
                <label className="text-zinc-500 block mb-1 font-bold">Kennel Menü Neve</label>
                <input type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full bg-black border border-zinc-900 rounded-lg p-2.5 text-white" />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <input type="text" name="owner_name" defaultValue={settings.owner_name} placeholder="Tenyésztő Neve" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
                <input type="text" name="kennel_address" defaultValue={settings.kennel_address} placeholder="Székhely Cím" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
                <input type="text" name="tax_number" defaultValue={settings.tax_number} placeholder="Adószám" className="bg-black border border-zinc-900 rounded-lg p-2 text-white" />
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-5 animate-fadeIn text-zinc-300">
              <h3 className="text-sm font-bold text-blue-400 border-b border-zinc-900 pb-2">🎨 Theme Architecture Settings</h3>

              {/* 1. MODE választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Mode</span>
                <div className="flex gap-4">
                  {["dark", "light", "system"].map((m) => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer capitalize font-bold">
                      <input type="radio" checked={themeMode === m} onChange={() => setThemeMode(m)} className="accent-purple-500" /> {m}
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. THEME választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Theme</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "midnight", name: "● Midnight Neon" },
                    { id: "aurora", name: "○ Aurora Arctic" },
                    { id: "emerald", name: "○ Emerald Forest" },
                    { id: "royal", name: "○ Royal Gold" },
                    { id: "custom", name: "⚙️ Custom Theme" }
                  ].map((t) => (
                    <button key={t.id} type="button" onClick={() => setPresetPalette(t.id)} className={`p-2 rounded-xl text-left border text-[11px] font-bold ${presetPalette === t.id ? "border-purple-500 bg-zinc-900" : "border-zinc-900 bg-black"}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Builder, ha be van kapcsolva */}
              {presetPalette === "custom" && (
                <div className="p-3 bg-black rounded-xl border border-zinc-900 grid grid-cols-2 gap-2 animate-slideDown">
                  <div><label className="text-zinc-500 block text-[9px] mb-0.5">Primary (Violet)</label><input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                  <div><label className="text-zinc-500 block text-[9px] mb-0.5">Accent (Lime)</label><input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                  <div><label className="text-zinc-500 block text-[9px] mb-0.5">Background</label><input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                  <div><label className="text-zinc-500 block text-[9px] mb-0.5">Card Base</label><input type="color" value={customCard} onChange={(e) => setCustomCard(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                </div>
              )}

              {/* 3. STYLE választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Style</span>
                <div className="flex gap-4">
                  {["flat", "glass", "neon"].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer capitalize font-bold">
                      <input type="radio" checked={uiStyle === s} onChange={() => setUiStyle(s)} className="accent-purple-500" /> {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. RADIUS választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Radius</span>
                <div className="flex gap-4">
                  {["sharp", "medium", "soft"].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer capitalize font-bold">
                      <input type="radio" checked={uiRadius === r} onChange={() => setUiRadius(r)} className="accent-purple-500" /> {r}
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. ANIMATION választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Animation</span>
                <div className="flex gap-4">
                  {["minimal", "normal", "dynamic"].map((a) => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer capitalize font-bold">
                      <input type="radio" checked={uiAnimation === a} onChange={() => setUiAnimation(a)} className="accent-purple-500" /> {a}
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. DENSITY (Density / Spacing) választó */}
              <div>
                <span className="text-zinc-500 font-bold block mb-1.5 uppercase text-[10px]">Density & Layout Spacing</span>
                <div className="flex gap-4">
                  {["compact", "balanced", "luxury"].map((d) => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer capitalize font-bold">
                      <input type="radio" checked={uiDensity === d} onChange={() => setUiDensity(d)} className="accent-purple-500" /> {d}
                    </label>
                  ))}
                </div>
              </div>

            </div>
          )}

          <button type="submit" disabled={isPending} className="w-full font-black p-3 rounded-xl uppercase tracking-wider text-xs transition-all bg-primary-btn">
            {isPending ? "Tokenek mentése..." : "🚀 TELJES STRATÉGIA ÉLESÍTÉSE"}
          </button>
        </div>

        {/* JOBB OSZLOP: VALÓS IDEJŰ TOKEN ALAPÚ ELŐNÉZET */}
        <div className="space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">👁️ Token Live Preview</span>
          <div className="border p-5 space-y-4" style={{ backgroundColor: "var(--bg)", borderRadius: "var(--radius)", borderColor: "var(--border)" }}>
            <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: "var(--border)" }}>
              <span className="font-black text-xs" style={{ color: "var(--text)" }}>🐾 {kennelName}</span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--primary)20", color: "var(--primary)" }}>PREVIEW</span>
            </div>

            {/* Kártyák különböző dinamikus árnyalatai bemutatva hardcoded színek nélkül */}
            <div className="space-y-2">
              <div className="p-3 border" style={{ borderRadius: "var(--radius)", backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}>
                <span className="font-bold text-[10px] block" style={{ color: "var(--primary)" }}>1. sz. Kártya (Violet tónus)</span>
                <span className="text-[11px]" style={{ color: "var(--text)", opacity: 0.7 }}>Dinamikus márka-árnyalat.</span>
              </div>
              <div className="p-3 border" style={{ borderRadius: "var(--radius)", backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}>
                <span className="font-bold text-[10px] block" style={{ color: "var(--accent)" }}>2. sz. Kártya (Lime tónus)</span>
                <span className="text-[11px]" style={{ color: "var(--text)", opacity: 0.7 }}>Alternatív árnyalat-mátrix.</span>
              </div>
            </div>

            <div className="w-full text-center py-2 rounded-xl font-black text-xs" style={{ backgroundColor: "var(--accent)", color: "#000000", borderRadius: "var(--radius)" }}>
              Gomb Előnézet
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

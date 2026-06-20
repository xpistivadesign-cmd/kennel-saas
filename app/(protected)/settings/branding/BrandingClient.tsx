"use client";

import { useState } from "react";

export default function BrandingClient({ settings }: any) {
  const [isSaving, setIsSaving] = useState(false);

  // States - Global & Palettes
  const [palette, setPalette] = useState(settings.preset_palette || "obsidian_dark");
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark");
  const [primary, setPrimary] = useState(settings.primary_color || "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color || "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color || "#000000");
  const [surface, setSurface] = useState(settings.surface_color || "#090A0F");
  const [text, setText] = useState(settings.text_color || "#FFFFFF");
  const [border, setBorder] = useState(settings.border_color || "rgba(255,255,255,0.08)");
  
  const [bgGradEnabled, setBgGradientEnabled] = useState(settings.bg_gradient_enabled === true);
  const [bgGradFrom, setBgGradientFrom] = useState(settings.bg_gradient_from || "#000000");
  const [bgGradTo, setBgGradientTo] = useState(settings.bg_gradient_to || "#090A0F");
  const [bgGradAngle, setBgGradientAngle] = useState(settings.bg_gradient_angle || 135);
  const [bgPattern, setBgPattern] = useState(settings.bg_pattern || "none");

  // States - Typography & Headings
  const [fontFamily, setFontFamily] = useState(settings.font_family || "inter");
  const [fontScale, setFontScale] = useState(settings.font_scale || 100);
  const [fontWeight, setFontWeight] = useState(settings.font_weight || 400);
  const [letterSpacing, setLetterSpacing] = useState(settings.letter_spacing || 0);
  const [headingColor, setHeadingColor] = useState(settings.heading_color || "#FFFFFF");
  const [headingUpper, setHeadingUppercase] = useState(settings.heading_uppercase === true);
  const [subHeadingColor, setSubHeadingColor] = useState(settings.sub_heading_color || "#9CA3AF");

  // States - Atomi Dashboard Widgets
  const [wDogsBg, setWidgetDogsBg] = useState(settings.widget_dogs_bg || "#7D39EB15");
  const [wLittersBg, setWidgetLittersBg] = useState(settings.widget_litters_bg || "#C6FF3310");
  const [wHeatsBg, setWidgetHeatsBg] = useState(settings.widget_heats_bg || "#7D39EB08");
  const [wFinanceBg, setWidgetFinanceBg] = useState(settings.widget_finance_bg || "#C6FF3308");

  // States - Gombok & Inputok
  const [btnPrimaryBg, setBtnPrimaryBg] = useState(settings.btn_primary_bg || "#C6FF33");
  const [btnPrimaryText, setBtnPrimaryText] = useState(settings.btn_primary_text || "#000000");
  const [btnRadius, setBtnRadius] = useState(settings.btn_radius || 12);
  const [inputBg, setInputBg] = useState(settings.input_bg || "rgba(255,255,255,0.04)");
  const [inputBorder, setInputBorder] = useState(settings.input_border || "rgba(255,255,255,0.08)");

  // States - Sidebar
  const [sidebarBg, setSidebarBg] = useState(settings.sidebar_bg || "#090A0F");
  const [sidebarActiveBg, setSidebarActiveBg] = useState(settings.sidebar_active_bg || "#7D39EB");
  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebar_width || 270);

  // States - Core Framework & Layout
  const [uiRadius, setUiRadius] = useState(settings.ui_radius || "medium");
  const [uiAnimation, setUiAnimation] = useState(settings.ui_animation || "normal");
  const [customCss, setCustomCss] = useState(settings.custom_css || "");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const fd = new FormData();
    fd.set("preset_palette", palette);
    fd.set("theme_mode", themeMode);
    fd.set("primary_color", primary);
    fd.set("accent_color", accent);
    fd.set("bg_color", bg);
    fd.set("surface_color", surface);
    fd.set("text_color", text);
    fd.set("border_color", border);
    fd.set("bg_gradient_enabled", String(bgGradEnabled));
    fd.set("bg_gradient_from", bgGradFrom);
    fd.set("bg_gradient_to", bgGradTo);
    fd.set("bg_gradient_angle", String(bgGradAngle));
    fd.set("bg_pattern", bgPattern);
    fd.set("font_family", fontFamily);
    fd.set("font_scale", String(fontScale));
    fd.set("font_weight", String(fontWeight));
    fd.set("letter_spacing", String(letterSpacing));
    fd.set("heading_color", headingColor);
    fd.set("heading_uppercase", String(headingUpper));
    fd.set("sub_heading_color", subHeadingColor);
    fd.set("widget_dogs_bg", wDogsBg);
    fd.set("widget_litters_bg", wLittersBg);
    fd.set("widget_heats_bg", wHeatsBg);
    fd.set("widget_finance_bg", wFinanceBg);
    fd.set("btn_primary_bg", btnPrimaryBg);
    fd.set("btn_primary_text", btnPrimaryText);
    fd.set("btn_radius", String(btnRadius));
    fd.set("input_bg", inputBg);
    fd.set("input_border", inputBorder);
    fd.set("sidebar_bg", sidebarBg);
    fd.set("sidebar_active_bg", sidebarActiveBg);
    fd.set("sidebar_width", String(sidebarWidth));
    fd.set("ui_radius", uiRadius);
    fd.set("ui_animation", uiAnimation);
    fd.set("custom_css", customCss);
    fd.set("kennel_name", kennelName);

    try {
      const res = await fetch("/api/branding", { method: "POST", body: fd });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Szerver hiba történt a tokenek feldolgozásakor.");
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🎨 Custom Theme Builder Matrix</h1>
        <p className="opacity-50 text-xs">Válassz a 4 hivatalos brand-preset közül, vagy aktiváld a Haladó Custom Designert az atomi testreszabáshoz.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SZEKCIÓ 1: CORE PRESETS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400">1. Core Presets (A 4 Hivatalos Arculat)</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "obsidian_dark", name: "Obsidian (Default Dark)" },
                { id: "obsidian_light", name: "Obsidian Light" },
                { id: "electric_dark", name: "Electric Blue Dark" },
                { id: "electric_light", name: "Electric Blue Light" },
                { id: "custom", name: "⚙️ Haladó Custom Designer Builder" }
              ].map(p => (
                <button key={p.id} type="button" onClick={() => setPalette(p.id)} className={`p-4 rounded-xl text-left text-xs font-bold border transition-all ${palette === p.id ? "border-purple-500 bg-zinc-900/60" : "border-zinc-800 bg-black"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* SZEKCIÓ 2: BRUTÁL RÉSZLETES CUSTOM DESIGNER BLOKK */}
          {palette === "custom" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* GLOBAL COLORS & BACKGROUND */}
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase text-blue-400">Global & App Background</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] block">Primary</label><input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Accent</label><input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Background</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Surface (Card)</label><input type="color" value={surface} onChange={e => setSurface(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Text Color</label><input type="color" value={text} onChange={e => setText(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Border Color</label><input type="color" value={border} onChange={e => setBorder(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                </div>

                <div className="pt-2 border-t border-zinc-900 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer text-xs">
                    <input type="checkbox" checked={bgGradEnabled} onChange={e => setBgGradientEnabled(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                    <span>Background Gradient Átmenet Aktiválása</span>
                  </label>
                  {bgGradEnabled && (
                    <div className="grid grid-cols-3 gap-2 animate-slideDown">
                      <div><label className="text-[10px] block">Gradient Start</label><input type="color" value={bgGradFrom} onChange={e => setBgGradientFrom(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                      <div><label className="text-[10px] block">Gradient End</label><input type="color" value={bgGradTo} onChange={e => setBgGradientTo(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                      <div><label className="text-[10px] block">Angle ({bgGradAngle}°)</label><input type="number" value={bgGradAngle} onChange={e => setBgGradientAngle(Number(e.target.value))} className="w-full bg-black p-1 text-xs border rounded" /></div>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] block mb-1">Dashboard Background Pattern (Mintázat)</label>
                    <select value={bgPattern} onChange={e => setBgPattern(e.target.value)} className="w-full bg-black p-2 rounded text-xs">
                      <option value="none">None (Tiszta solid)</option>
                      <option value="dots">Dots (Finom pöttyözött)</option>
                      <option value="grid">Grid (Technikai rácsháló)</option>
                      <option value="noise">Noise (Prémium szemcsézett)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TYPOGRAPHY & HEADINGS */}
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase text-amber-400">Typography & Headings Matrix</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] block mb-1">Font Family</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-black p-2 rounded text-xs">
                      <option value="inter">Inter Framework</option>
                      <option value="manrope">Manrope Corporate</option>
                      <option value="sora">Sora Interface</option>
                      <option value="poppins">Poppins Geometric</option>
                      <option value="jakarta">Plus Jakarta Sans</option>
                      <option value="grotesk">Space Grotesk</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div><label className="text-[9px] block">Scale (%)</label><input type="number" value={fontScale} onChange={e => setFontScale(Number(e.target.value))} className="w-full bg-black p-1.5 text-xs border rounded" /></div>
                    <div><label className="text-[9px] block">Weight</label><input type="number" value={fontWeight} onChange={e => setFontWeight(Number(e.target.value))} className="w-full bg-black p-1.5 text-xs border rounded" /></div>
                    <div><label className="text-[9px] block">Spacing</label><input type="number" value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} className="w-full bg-black p-1.5 text-xs border rounded" /></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
                  <div><label className="text-[10px] block">Főcím színe</label><input type="color" value={headingColor} onChange={e => setHeadingColor(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Alcím színe</label><input type="color" value={subHeadingColor} onChange={e => setSubHeadingColor(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] pt-4">
                    <input type="checkbox" checked={headingUpper} onChange={e => setHeadingUppercase(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-zinc-800" />
                    <span>UPPERCASE FŐCÍMEK</span>
                  </label>
                </div>
              </div>

              {/* ATOMI DASHBOARD WIDGETEK */}
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase text-lime-400">Atomi Dashboard Widgets Színezése</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-[10px] block mb-0.5">🐕 Dogs widget háttér</label><input type="color" value={wDogsBg} onChange={e => setWidgetDogsBg(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block mb-0.5">🐾 Litters widget háttér</label><input type="color" value={wLittersBg} onChange={e => setWidgetLittersBg(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block mb-0.5">🩸 Heats widget háttér</label><input type="color" value={wHeatsBg} onChange={e => setWidgetHeatsBg(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                  <div><label className="text-[10px] block mb-0.5">💰 Finance widget háttér</label><input type="color" value={wFinanceBg} onChange={e => setWidgetFinanceBg(e.target.value)} className="w-full h-8 bg-transparent" /></div>
                </div>
              </div>

              {/* GOMBOK & SIDEBAR TUNING */}
              <div className="card p-6 space-y-4">
                <h3 className="font-bold text-xs uppercase text-orange-400">Gombok, Inputok & Sidebar Architecture</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[10px] block">Button BG</label><input type="color" value={btnPrimaryBg} onChange={e => setBtnPrimaryBg(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Button Text</label><input type="color" value={btnPrimaryText} onChange={e => setBtnPrimaryText(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Gomb Sugár</label><input type="number" value={btnRadius} onChange={e => setBtnRadius(Number(e.target.value))} className="w-full bg-black p-1 text-xs border rounded" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900">
                  <div><label className="text-[10px] block">Sidebar BG</label><input type="color" value={sidebarBg} onChange={e => setSidebarBg(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Sidebar Active Tab</label><input type="color" value={sidebarActiveBg} onChange={e => setSidebarActiveBg(e.target.value)} className="w-full h-7 bg-transparent" /></div>
                  <div><label className="text-[10px] block">Sidebar Szélesség</label><input type="number" value={sidebarWidth} onChange={e => setSidebarWidth(Number(e.target.value))} className="w-full bg-black p-1 text-xs border rounded" /></div>
                </div>
              </div>

            </div>
          )}

          {/* FRAMEWORK MECHANICS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase text-teal-400">Core Layout Framework Mechanics</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] block">Layout Radius</label><select value={uiRadius} onChange={e => setUiRadius(e.target.value)} className="w-full bg-black p-2 rounded text-xs"><option value="sharp">sharp (0px)</option><option value="small">small (6px)</option><option value="medium">medium (14px)</option><option value="soft">soft (22px)</option><option value="luxury">luxury (32px)</option></select></div>
              <div><label className="text-[10px] block">Animations</label><select value={uiAnimation} onChange={e => setUiAnimation(e.target.value)} className="w-full bg-black p-2 rounded text-xs"><option value="off">off</option><option value="minimal">minimal</option><option value="normal">normal</option></select></div>
              <div><label className="text-[10px] block">Style Core</label><select value={uiStyle} onChange={e => setUiStyle(e.target.value)} className="w-full bg-black p-2 rounded text-xs"><option value="flat">flat layer</option><option value="glass">glassmorphism</option><option value="neon">neon glow</option></select></div>
            </div>
          </div>

          <div className="card p-6 space-y-2">
            <h3 className="font-bold text-xs uppercase text-red-500">9. Advanced Injection Layer (Custom CSS)</h3>
            <textarea value={customCss} onChange={e => setCustomCss(e.target.value)} placeholder=".card { backdrop-filter: blur(20px); }" className="w-full h-24 bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs text-white" />
          </div>

          <button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black uppercase tracking-wider text-xs shadow-2xl flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                ENGAGING SYSTEM TOKENS MATRIX...
              </>
            ) : "🚀 ARCULATI STRATÉGIA GLOBÁLIS ÉLESÍTÉSE"}
          </button>
        </div>

        {/* LIVE SYSTEM PREVIEW LAYER */}
        <div className="space-y-4 sticky top-6">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">👁️ Live System Matrix View</span>
          <div className="card p-6 space-y-4" style={{ backgroundColor: bg, borderColor: border, backgroundImage: bgGradEnabled ? `linear-gradient(${bgGradAngle}deg, ${bgGradFrom}, ${bgGradTo})` : "none" }}>
            <h2 className="text-lg font-black" style={{ color: headingColor, textTransform: headingUpper ? "uppercase" : "none" }}>🐾 Preview Kennel</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 rounded-xl border text-[11px] font-bold widget-dogs-card" style={{ background: wDogsBg, color: text, borderColor: border }}>Dogs Widget</div>
              <div className="p-4 rounded-xl border text-[11px] font-bold widget-litters-card" style={{ background: wLittersBg, color: text, borderColor: border }}>Litters Widget</div>
            </div>
            <button type="button" className="w-full p-3 font-bold text-xs" style={{ background: btnPrimaryBg, color: btnPrimaryText, borderRadius: `${btnRadius}px` }}>Primary Action CTA</button>
          </div>
        </div>
      </div>
    </form>
  );
}

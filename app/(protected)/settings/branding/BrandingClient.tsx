"use client";

import { useState } from "react";

export default function BrandingClient({ settings }: any) {
  const [isSaving, setIsSaving] = useState(false);

  // 1. Brand Colors
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark");
  const [palette, setPalette] = useState(settings.preset_palette || "midnight");
  const [primary, setPrimary] = useState(settings.primary_color || "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color || "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color || "#000000");
  const [surface, setSurface] = useState(settings.surface_color || "#090A0F");
  const [textColor, setTextColor] = useState(settings.text_color || "#FFFFFF");
  const [borderColor, setBorderColor] = useState(settings.border_color || "rgba(255,255,255,0.08)");

  // 2. Dashboard Cards
  const [cardMode, setCardMode] = useState(settings.card_mode || "uniform");
  const [card1, setCard1] = useState(settings.card_1 || "#7D39EB15");
  const [card2, setCard2] = useState(settings.card_2 || "#C6FF3310");
  const [card3, setCard3] = useState(settings.card_3 || "#7D39EB08");
  const [card4, setCard4] = useState(settings.card_4 || "#C6FF3308");
  const [cardGlow, setCardGlow] = useState(settings.card_glow || 0);
  const [cardBlur, setCardBlur] = useState(settings.card_blur || 0);
  const [cardOpacity, setCardOpacity] = useState(settings.card_opacity || 100);

  // 3. Gradient Builder
  const [gradEnabled, setGradEnabled] = useState(settings.gradient_enabled === true);
  const [gradType, setGradType] = useState(settings.gradient_type || "linear");
  const [gradFrom, setGradFrom] = useState(settings.gradient_from || "#7D39EB");
  const [gradTo, setGradTo] = useState(settings.gradient_to || "#C6FF33");
  const [gradAngle, setGradAngle] = useState(settings.gradient_angle || 135);
  const [gradStrength, setGradStrength] = useState(settings.gradient_strength || 50);

  // 4. Glass Effect
  const [glassEnabled, setGlassEnabled] = useState(settings.glass_enabled === true);
  const [glassBlur, setGlassBlur] = useState(settings.glass_blur || 18);
  const [glassOpacity, setGlassOpacity] = useState(settings.glass_opacity || 20);
  const [glassBorder, setGlassBorder] = useState(settings.glass_border_glow || 0);
  const [glassShadow, setGlassShadow] = useState(settings.glass_shadow || 15);

  // 5. Typography
  const [fontFamily, setFontFamily] = useState(settings.font_family || "inter");
  const [fontScale, setFontScale] = useState(settings.font_scale || 100);
  const [fontWeight, setFontWeight] = useState(settings.font_weight || 400);
  const [letterSpacing, setLetterSpacing] = useState(settings.letter_spacing || 0);

  // 6. Buttons
  const [btnStyle, setButtonStyle] = useState(settings.button_style || "solid");
  const [btnRadius, setButtonRadius] = useState(settings.button_radius || 12);
  const [btnGlow, setButtonGlow] = useState(settings.button_glow || 0);

  // 7. Sidebar
  const [sidebarBg, setSidebarBg] = useState(settings.sidebar_bg || "rgba(255,255,255,0.02)");
  const [sidebarActive, setSidebarActive] = useState(settings.sidebar_active || "#7D39EB");
  const [sidebarHover, setSidebarHover] = useState(settings.sidebar_hover || "rgba(255,255,255,0.04)");
  const [sidebarWidth, setSidebarWidth] = useState(settings.sidebar_width || 270);

  // 8. Effects & Advanced
  const [uiRadius, setUiRadius] = useState(settings.ui_radius || "medium");
  const [uiAnimation, setUiAnimation] = useState(settings.ui_animation || "normal");
  const [uiStyle, setUiStyle] = useState(settings.ui_style || "glass");
  const [customCss, setCustomCss] = useState(settings.custom_css || "");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  // ⚡ A FIXÁLT, FAGYÁSMENTES, ATOMI BIZTOS API BEKÜLDÉS FETCH-CHEL!
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const fd = new FormData(e.currentTarget);
    fd.set("theme_mode", themeMode);
    fd.set("preset_palette", palette);
    fd.set("primary_color", primary);
    fd.set("accent_color", accent);
    fd.set("bg_color", bg);
    fd.set("surface_color", surface);
    fd.set("text_color", textColor);
    fd.set("border_color", borderColor);

    fd.set("card_mode", cardMode);
    fd.set("card_1", card1);
    fd.set("card_2", card2);
    fd.set("card_3", card3);
    fd.set("card_4", card4);
    fd.set("card_glow", String(cardGlow));
    fd.set("card_blur", String(cardBlur));
    fd.set("card_opacity", String(cardOpacity));

    fd.set("gradient_enabled", String(gradEnabled));
    fd.set("gradient_type", gradType);
    fd.set("gradient_from", gradFrom);
    fd.set("gradient_to", gradTo);
    fd.set("gradient_angle", String(gradAngle));
    fd.set("gradient_strength", String(gradStrength));

    fd.set("glass_enabled", String(glassEnabled));
    fd.set("glass_blur", String(glassBlur));
    fd.set("glass_opacity", String(glassOpacity));
    fd.set("glass_border_glow", String(glassBorder));
    fd.set("glass_shadow", String(glassShadow));

    fd.set("font_family", fontFamily);
    fd.set("font_scale", String(fontScale));
    fd.set("font_weight", String(fontWeight));
    fd.set("letter_spacing", String(letterSpacing));

    fd.set("button_style", btnStyle);
    fd.set("button_radius", String(btnRadius));
    fd.set("button_glow", String(btnGlow));

    fd.set("sidebar_bg", sidebarBg);
    fd.set("sidebar_active", sidebarActive);
    fd.set("sidebar_hover", sidebarHover);
    fd.set("sidebar_width", String(sidebarWidth));

    fd.set("ui_radius", uiRadius);
    fd.set("ui_animation", uiAnimation);
    fd.set("ui_style", uiStyle);
    fd.set("custom_css", customCss);
    fd.set("kennel_name", kennelName);

    try {
      const res = await fetch("/api/branding", { method: "POST", body: fd });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("Szerver hiba történt!");
        setIsSaving(false);
      }
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-4xl font-black">Appearance & Architecture Control</h1>
        <p className="opacity-60">Prémium White-Label Custom Theme Builder & Tokener Matrix.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. BRAND COLORS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-purple-400">1. Brand Colors (Fő színek)</h3>
            <div>
              <label className="text-[11px] block mb-1">Kennel Megjelenítési Neve</label>
              <input type="text" value={kennelName} onChange={e => setKennelName(e.target.value)} className="w-full p-3 bg-black rounded-xl border border-zinc-800 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block mb-1">Theme Mode</label>
                <select value={themeMode} onChange={e => setThemeMode(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Preset Palette</label>
                <select value={palette} onChange={e => setPalette(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  {PALETTES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            {palette === "custom" && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800 animate-fadeIn">
                <div><label className="text-[10px] block mb-0.5">Primary (Violet)</label><input type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Accent (Lime)</label><input type="color" value={accent} onChange={e => setAccent(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Background</label><input type="color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Surface</label><input type="color" value={surface} onChange={e => setSurface(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Global Text</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Border</label><input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 2. DASHBOARD CARDS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-lime-400">2. Dashboard Cards Strategy</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block mb-1">Card Coloring Mode</label>
                <select value={cardMode} onChange={e => setCardMode(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="uniform">Uniform (Same Color)</option>
                  <option value="alternating">Alternating Mode</option>
                  <option value="violet">Violet Shades</option>
                  <option value="lime">Lime Shades</option>
                  <option value="mixed">Mixed Architecture</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4">
                <div><span className="text-[10px] opacity-40 block">Card Glow</span><input type="range" min="0" max="100" value={cardGlow} onChange={e => setCardGlow(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Card Blur</span><input type="range" min="0" max="40" value={cardBlur} onChange={e => setCardBlur(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Opacity</span><input type="range" min="60" max="100" value={cardOpacity} onChange={e => setCardOpacity(Number(e.target.value))} className="w-full" /></div>
              </div>
            </div>

            {cardMode === "alternating" && (
              <div className="grid grid-cols-4 gap-2 pt-2 animate-slideDown">
                <div><label className="text-[9px] block">Card 1</label><input type="color" value={card1} onChange={e => setCard1(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[9px] block">Card 2</label><input type="color" value={card2} onChange={e => setCard2(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[9px] block">Card 3</label><input type="color" value={card3} onChange={e => setCard3(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[9px] block">Card 4</label><input type="color" value={card4} onChange={e => setCard4(e.target.value)} className="w-full h-7 bg-transparent cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 3. GRADIENT BUILDER */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-blue-400 text-sm">3. Gradient Builder</h3>
              <input type="checkbox" checked={gradEnabled} onChange={e => setGradEnabled(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0 cursor-pointer" />
            </div>
            {gradEnabled && (
              <div className="grid grid-cols-3 gap-3 animate-slideDown">
                <div><label className="text-[11px] block">Type</label><select value={gradType} onChange={e => setGradType(e.target.value)} className="w-full bg-black p-2.5 rounded-xl border border-zinc-800 text-xs"><option value="linear">Linear</option><option value="radial">Radial</option></select></div>
                <div><label className="text-[11px] block">Angle (0-360°)</label><input type="number" value={gradAngle} onChange={e => setGradAngle(Number(e.target.value))} className="w-full bg-black p-2 rounded-xl border border-zinc-800 text-xs" /></div>
                <div><label className="text-[11px] block">Strength</label><input type="range" min="0" max="100" value={gradStrength} onChange={e => setGradStrength(Number(e.target.value))} className="w-full" /></div>
                <div><label className="text-[10px] block">Color From</label><input type="color" value={gradFrom} onChange={e => setGradFrom(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block">Color To</label><input type="color" value={gradTo} onChange={e => setGradTo(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 4. GLASS EFFECT */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-cyan-400 text-sm">4. Glass Effect</h3>
              <input type="checkbox" checked={glassEnabled} onChange={e => setGlassEnabled(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0 cursor-pointer" />
            </div>
            {glassEnabled && (
              <div className="grid grid-cols-4 gap-2 animate-slideDown">
                <div><span className="text-[10px] opacity-40 block">Blur (0-40)</span><input type="range" min="0" max="40" value={glassBlur} onChange={e => setGlassBlur(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Opacity</span><input type="range" min="0" max="100" value={glassOpacity} onChange={e => setGlassOpacity(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Border Glow</span><input type="range" min="0" max="100" value={glassBorder} onChange={e => setGlassBorder(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Shadow</span><input type="range" min="0" max="100" value={glassShadow} onChange={e => setGlassShadow(Number(e.target.value))} className="w-full" /></div>
              </div>
            )}
          </div>

          {/* 5. TYPOGRAPHY */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-amber-400 text-sm">5. Typography & Font Tuning</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block mb-1">Font Family</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="inter">Inter Framework</option>
                  <option value="geist">Geist Mono Sans</option>
                  <option value="poppins">Poppins Geometric</option>
                  <option value="manrope">Manrope Corporate</option>
                  <option value="sora">Sora Interface</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-[10px] block">Scale</label><input type="number" value={fontScale} onChange={e => setFontScale(Number(e.target.value))} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs" /></div>
                <div><label className="text-[10px] block">Weight</label><input type="number" value={fontWeight} onChange={e => setFontWeight(Number(e.target.value))} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs" /></div>
                <div><label className="text-[10px] block">Spacing</label><input type="number" value={letterSpacing} onChange={e => setLetterSpacing(Number(e.target.value))} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs" /></div>
              </div>
            </div>
          </div>

          {/* 6. BUTTONS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-orange-400">6. Buttons Matrix</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block">Button Mode</label>
                <select value={btnStyle} onChange={e => setButtonStyle(e.target.value)} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="solid">Solid Base</option>
                  <option value="glass">Glass Transparent</option>
                  <option value="gradient">Gradient Engine</option>
                  <option value="outline">Outline Border</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div><span className="text-[10px] opacity-40 block">Radius</span><input type="range" min="0" max="40" value={btnRadius} onChange={e => setButtonRadius(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Button Glow</span><input type="range" min="0" max="100" value={btnGlow} onChange={e => setButtonGlow(Number(e.target.value))} className="w-full" /></div>
              </div>
            </div>
          </div>

          {/* 7. SIDEBAR */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-pink-400">7. Sidebar Spec</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[9px] block">Background</label><input type="color" value={sidebarBg} onChange={e => setSidebarBg(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              <div><label className="text-[9px] block">Active Tab</label><input type="color" value={sidebarActive} onChange={e => setSidebarActive(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              <div><label className="text-[9px] block">Hover Tab</label><input type="color" value={sidebarHover} onChange={e => setSidebarHover(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
            </div>
            <div><span className="text-[10px] opacity-40 block">Sidebar Width ({sidebarWidth}px)</span><input type="range" min="240" max="340" value={sidebarWidth} onChange={e => setSidebarWidth(Number(e.target.value))} className="w-full" /></div>
          </div>

          {/* 8. ARCHITECTURE EFFECTS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-teal-400">8. Core Layout Settings</h3>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[10px] block">Style Mode</label><select value={uiStyle} onChange={e => setUiStyle(e.target.value)} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs"><option value="flat">flat</option><option value="glass">glass</option><option value="neon">neon</option></select></div>
              <div><label className="text-[10px] block">Radius Mod</label><select value={uiRadius} onChange={e => setUiRadius(e.target.value)} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs"><option value="sharp">sharp</option><option value="small">small</option><option value="medium">medium</option><option value="soft">soft</option><option value="luxury">luxury</option></select></div>
              <div><label className="text-[10px] block">Animations</label><select value={uiAnimation} onChange={e => setUiAnimation(e.target.value)} className="w-full bg-black p-2 rounded border border-zinc-800 text-xs"><option value="off">off</option><option value="minimal">minimal</option><option value="normal">normal</option><option value="dynamic">dynamic</option></select></div>
            </div>
          </div>

          {/* 9. ADVANCED LAYERS */}
          <div className="card p-6 space-y-2">
            <h3 className="font-bold text-sm text-red-500">9. Advanced Layer (Custom CSS Injection)</h3>
            <textarea value={customCss} onChange={e => setCustomCss(e.target.value)} placeholder=".card { backdrop-filter: blur(20px); }" className="w-full h-24 bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs" />
          </div>

          <button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black uppercase tracking-wider text-xs shadow-2xl flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                ARCHITECTING SYSTEM TOKENS...
              </>
            ) : "🚀 ARCULATI STRATÉGIA GLOBÁLIS ÉLESÍTÉSE"}
          </button>
        </div>

        {/* VALÓS IDEJŰ LIVE PREVIEW OSZLOP */}
        <div className="space-y-4 sticky top-6">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">👁️ Live System Matrix View</span>
          <div className="card p-6 space-y-4" style={{ backgroundColor: bg }}>
            <h2 className="text-lg font-black" style={{ color: primary }}>🐾 Preview Kennel</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 rounded-xl border text-[11px] font-bold" style={{ background: card1, color: textColor }}>Card 1 Matrix</div>
              <div className="p-4 rounded-xl border text-[11px] font-bold" style={{ background: card2, color: textColor }}>Card 2 Matrix</div>
            </div>
            <button type="button" className="w-full p-3 font-bold text-xs" style={{ background: accent, borderRadius: `${btnRadius}px` }}>CTA Button Preview</button>
          </div>
        </div>
      </div>
    </form>
  );
}

const PALETTES = [
  { id: "midnight", name: "Midnight Neon" },
  { id: "aurora", name: "Aurora Arctic" },
  { id: "electric", name: "Electric Quantum" },
  { id: "royal", name: "Royal Gold Matrix" },
  { id: "lime", name: "Violet Lime Studio" },
  { id: "custom", name: "⚙️ Haladó Custom Builder" }
];

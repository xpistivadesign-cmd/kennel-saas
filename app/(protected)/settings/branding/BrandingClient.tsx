"use client";

import { useState, useTransition } from "react";

export default function BrandingClient({ settings, saveBrandingAction }: any) {
  const [pending, startTransition] = useTransition();

  // State Management a teljes Token Rendszerhez
  const [themeMode, setThemeMode] = useState(settings.theme_mode || "dark");
  const [palette, setPalette] = useState(settings.preset_palette || "midnight");

  const [primary, setPrimary] = useState(settings.primary_color || "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color || "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color || "#000000");
  const [surface, setSurface] = useState(settings.surface_color || "#090A0F");
  const [textColor, setTextColor] = useState(settings.text_color || "#FFFFFF");

  const [cardMode, setCardMode] = useState(settings.card_mode || "uniform");
  const [cardGlow, setCardGlow] = useState(settings.card_glow || 0);
  const [cardBlur, setCardBlur] = useState(settings.card_blur || 0);
  const [cardOpacity, setCardOpacity] = useState(settings.card_opacity || 100);

  const [gradEnabled, setGradEnabled] = useState(settings.gradient_enabled === true);
  const [gradType, setGradType] = useState(settings.gradient_type || "linear");
  const [gradFrom, setGradFrom] = useState(settings.gradient_from || "#7D39EB");
  const [gradTo, setGradTo] = useState(settings.gradient_to || "#C6FF33");
  const [gradAngle, setGradAngle] = useState(settings.gradient_angle || 135);
  const [gradStrength, setGradStrength] = useState(settings.gradient_strength || 50);

  const [glassEnabled, setGlassEnabled] = useState(settings.glass_enabled === true);
  const [glassBlur, setGlassBlur] = useState(settings.glass_blur || 18);
  const [glassOpacity, setGlassOpacity] = useState(settings.glass_opacity || 20);
  const [glassBorder, setGlassBorder] = useState(settings.glass_border_glow || 0);
  const [glassShadow, setGlassShadow] = useState(settings.glass_shadow || 15);

  const [fontFamily, setFontFamily] = useState(settings.font_family || "inter");
  const [fontScale, setFontScale] = useState(settings.font_scale || 100);
  const [fontWeight, setFontWeight] = useState(settings.font_weight || 400);
  const [letterSpacing, setLetterSpacing] = useState(settings.letter_spacing || 0);

  const [btnStyle, setButtonStyle] = useState(settings.button_style || "solid");
  const [btnRadius, setButtonRadius] = useState(settings.button_radius || 12);
  const [btnGlow, setButtonGlow] = useState(settings.button_glow || 0);

  const [customCss, setCustomCss] = useState(settings.custom_css || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("theme_mode", themeMode);
    fd.set("preset_palette", palette);
    fd.set("gradient_enabled", String(gradEnabled));
    fd.set("glass_enabled", String(glassEnabled));

    startTransition(async () => {
      await saveBrandingAction(fd);
      window.location.reload();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🎨 Appearance Matrix</h1>
        <p className="opacity-50 text-xs">Tokenizált dizájnrendszer-vezérlő valós idejű Live Preview támogatással.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. BRAND COLORS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-purple-400">1. Brand Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block mb-1">Theme Mode</label>
                <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} name="theme_mode" className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] block mb-1">Preset Palette</label>
                <select value={palette} onChange={(e) => setPalette(e.target.value)} name="preset_palette" className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  {PALETTES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            {palette === "custom" && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-900 animate-fadeIn">
                <div><label className="text-[10px] block mb-0.5">Primary</label><input type="color" name="primary_color" value={primary} onChange={e => setPrimary(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Accent</label><input type="color" name="accent_color" value={accent} onChange={e => setAccent(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Background</label><input type="color" name="bg_color" value={bg} onChange={e => setBg(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Surface</label><input type="color" name="surface_color" value={surface} onChange={e => setSurface(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Text</label><input type="color" name="text_color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 2. DASHBOARD CARDS */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-lime-400">2. Dashboard Cards Settings</h3>
            <div>
              <label className="text-[11px] block mb-1">Card Coloring Mode</label>
              <select value={cardMode} onChange={(e) => setCardMode(e.target.value)} name="card_mode" className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                <option value="uniform">Uniform (Same Color)</option>
                <option value="alternating">Alternate Modes</option>
                <option value="violet">Violet Shades Matrix</option>
                <option value="lime">Lime Shades Matrix</option>
                <option value="mixed">Mixed Architecture</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><span className="text-[10px] opacity-40 block">Glow ({cardGlow})</span><input type="range" name="card_glow" min="0" max="100" value={cardGlow} onChange={e => setCardGlow(Number(e.target.value))} className="w-full accent-lime-400" /></div>
              <div><span className="text-[10px] opacity-40 block">Blur ({cardBlur})</span><input type="range" name="card_blur" min="0" max="40" value={cardBlur} onChange={e => setCardBlur(Number(e.target.value))} className="w-full accent-lime-400" /></div>
              <div><span className="text-[10px] opacity-40 block">Opacity ({cardOpacity}%)</span><input type="range" name="card_opacity" min="60" max="100" value={cardOpacity} onChange={e => setCardOpacity(Number(e.target.value))} className="w-full accent-lime-400" /></div>
            </div>
          </div>

          {/* 3. GRADIENT BUILDER */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-blue-400">3. Gradient Builder</h3>
              <input type="checkbox" checked={gradEnabled} onChange={e => setGradEnabled(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0 cursor-pointer" />
            </div>
            {gradEnabled && (
              <div className="grid grid-cols-2 gap-4 animate-slideDown">
                <div>
                  <label className="text-[11px] block mb-1">Gradient Type</label>
                  <select value={gradType} onChange={e => setGradType(e.target.value)} name="gradient_type" className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                    <option value="linear">Linear Gradient</option>
                    <option value="radial">Radial Engine</option>
                  </select>
                </div>
                <div><label className="text-[11px] block mb-1">Angle (0-360°)</label><input type="number" name="gradient_angle" value={gradAngle} onChange={e => setGradAngle(Number(e.target.value))} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs" /></div>
                <div><label className="text-[10px] block mb-0.5">Color A</label><input type="color" name="gradient_from" value={gradFrom} onChange={e => setGradFrom(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Color B</label><input type="color" name="gradient_to" value={gradTo} onChange={e => setGradTo(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
            )}
          </div>

          {/* 4. GLASS EFFECT */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-cyan-400">4. Glassmorphism Engine</h3>
              <input type="checkbox" checked={glassEnabled} onChange={e => setGlassEnabled(e.target.checked)} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0 cursor-pointer" />
            </div>
            {glassEnabled && (
              <div className="grid grid-cols-2 gap-4 animate-slideDown">
                <div><span className="text-[10px] opacity-40 block">Blur Intensity ({glassBlur}px)</span><input type="range" name="glass_blur" min="0" max="40" value={glassBlur} onChange={e => setGlassBlur(Number(e.target.value))} className="w-full" /></div>
                <div><span className="text-[10px] opacity-40 block">Transparency ({glassOpacity}%)</span><input type="range" name="glass_opacity" min="0" max="100" value={glassOpacity} onChange={e => setGlassOpacity(Number(e.target.value))} className="w-full" /></div>
              </div>
            )}
          </div>

          {/* 5. TYPOGRAPHY */}
          <div className="card p-6 space-y-4">
            <h3 className="font-bold border-b border-zinc-800 pb-2 text-sm text-amber-400">5. Typography & Font Scale</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] block mb-1">Font Family</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} name="font_family" className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                  <option value="inter">Inter Framework</option>
                  <option value="geist">Geist Mono Sans</option>
                  <option value="poppins">Poppins Geometric</option>
                  <option value="manrope">Manrope Corporate</option>
                  <option value="sora">Sora Interface</option>
                </select>
              </div>
              <div><label className="text-[11px] block mb-1">Font Scale (80% - 140%)</label><input type="number" name="font_scale" value={fontScale} onChange={e => setFontScale(Number(e.target.value))} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs" /></div>
            </div>
          </div>

          {/* ADVANCED CUSTOM CSS */}
          <div className="card p-6 space-y-2">
            <h3 className="font-bold text-sm text-red-400">9. Advanced Layer (Custom CSS)</h3>
            <textarea name="custom_css" value={customCss} onChange={e => setCustomCss(e.target.value)} placeholder=".card { backdrop-filter: blur(20px); }" className="w-full h-24 bg-black border border-zinc-800 rounded-xl p-3 font-mono text-xs" />
          </div>

          <button type="submit" disabled={pending} className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black uppercase tracking-wider text-xs shadow-2xl">
            {pending ? "ARCHITECTING TOKENS..." : "🚀 ARCUALTI STRATÉGIA ÉLESÍTÉSE GLOBÁLISAN"}
          </button>
        </div>

        {/* VALÓS IDEJŰ LIVE PREVIEW */}
        <div className="space-y-4 sticky top-6">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">👁️ Live System Matrix View</span>
          <div className="card p-6 space-y-4" style={{ backgroundColor: bg }}>
            <h2 className="text-lg font-black" style={{ color: primary }}>🐾 Preview Kennel</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-4 rounded-xl border text-[11px] font-bold" style={{ background: `${primary}15` }}>Card 1 (Primary Shade)</div>
              <div className="p-4 rounded-xl border text-[11px] font-bold" style={{ background: `${accent}10` }}>Card 2 (Accent Shade)</div>
            </div>
            <button type="button" className="w-full p-3 font-bold text-xs" style={{ background: accent }}>CTA Button Preview</button>
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

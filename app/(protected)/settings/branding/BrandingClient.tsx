"use client";

import { useTransition, useState } from "react";

interface BrandingSettings {
  accent_color: string;
  bg_style: string;
  font_family: string;
  logo_url: string | null;
}

interface BrandingClientProps {
  settings: BrandingSettings;
  saveBrandingAction: (formData: FormData) => Promise<void>;
}

export default function BrandingClient({ settings, saveBrandingAction }: BrandingClientProps) {
  const [isPending, startTransition] = useTransition();

  // Lokális állapotok az azonnali élő előnézethez
  const [accent, setAccent] = useState(settings.accent_color);
  const [bgStyle, setBgStyle] = useState(settings.bg_style);
  const [font, setFont] = useState(settings.font_family);
  const [logo, setLogo] = useState(settings.logo_url || "");

  // Háttér stílus osztályok az előnézethez
  const getBgClass = (style: string) => {
    if (style === "pitch-black") return "bg-black border-zinc-900";
    if (style === "slate") return "bg-slate-950 border-slate-900";
    return "bg-zinc-950 border-zinc-900"; // cink alapértelmezett
  };

  // Betűtípus osztályok az előnézethez
  const getFontClass = (fontFamily: string) => {
    if (fontFamily === "mono") return "font-mono";
    if (fontFamily === "serif") return "font-serif";
    return "font-sans";
  };

  return (
    <div className="space-y-8 text-white text-xs max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">White-Label & Arculat</h1>
        <p className="text-zinc-500 text-xs mt-1">Szabd személyre a szoftver megjelenését a saját kenneled ízlésére és színeire.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Bal oldal: Beállítások űrlap */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl space-y-5">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider border-b border-zinc-900 pb-2">🎨 Megjelenési Beállítások</h3>
          
          <form action={(fd) => startTransition(async () => { await saveBrandingAction(fd); alert("Arculat sikeresen elmentve!"); })} className="space-y-4">
            
            {/* 1. Kísérőszín választó */}
            <div>
              <label className="text-zinc-400 block mb-1.5 font-bold">Kísérőszín (Gombok, kiemelések)</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color" 
                  name="accent_color" 
                  value={accent} 
                  onChange={(e) => setAccent(e.target.value)} 
                  className="w-10 h-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                />
                <input 
                  type="text" 
                  value={accent} 
                  onChange={(e) => setAccent(e.target.value)}
                  className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-center w-28 text-white" 
                />
              </div>
            </div>

            {/* 2. Háttér téma */}
            <div>
              <label className="text-zinc-400 block mb-1.5 font-bold">Sötét mód árnyalata</label>
              <select 
                name="bg_style" 
                value={bgStyle} 
                onChange={(e) => setBgStyle(e.target.value)}
                className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white"
              >
                <option value="zinc">Midnight Zinc (Mélyszürke)</option>
                <option value="slate">Deep Slate (Kékes-fekete)</option>
                <option value="pitch-black">Pitch Black (Tiszta koromfekete)</option>
              </select>
            </div>

            {/* 3. Betűtípus */}
            <div>
              <label className="text-zinc-400 block mb-1.5 font-bold">Rendszer Betűtípusa</label>
              <select 
                name="font_family" 
                value={font} 
                onChange={(e) => setFont(e.target.value)}
                className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white"
              >
                <option value="sans">Modern Sans-Serif (Letisztult, gömbölyded)</option>
                <option value="mono">Developer Mono (Technikai, fix szélességű)</option>
                <option value="serif">Elegant Serif (Klasszikus, talpas újságstílus)</option>
              </select>
            </div>

            {/* 4. Saját Logó URL */}
            <div>
              <label className="text-zinc-400 block mb-1.5 font-bold">Saját Kennel Logó (Kép URL címe)</label>
              <input 
                name="logo_url" 
                type="url" 
                placeholder="https://pelda.hu/logo.png" 
                value={logo} 
                onChange={(e) => setLogo(e.target.value)}
                className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white font-mono text-xs" 
              />
              <p className="text-[10px] text-zinc-600 mt-1">Illeszd be a kenneled logójának közvetlen linkjét (.png vagy .jpg).</p>
            </div>

            {/* Mentés gomb */}
            <button 
              type="submit" 
              disabled={isPending} 
              className="w-full rounded-lg py-2.5 font-bold text-black uppercase tracking-wider text-xs transition-all"
              style={{ backgroundColor: accent }}
            >
              {isPending ? "Mentés folyamatban..." : "✨ Arculat Élesítése"}
            </button>
          </form>
        </div>

        {/* Jobb oldal: 👁️ ÉLŐ ELŐNÉZET DOBOZ */}
        <div className="space-y-3">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">✨ Élő Előnézet (Live Preview)</span>
          
          <div className={`border p-6 rounded-2xl shadow-2xl space-y-6 transition-all duration-300 ${getBgClass(bgStyle)} ${getFontClass(font)}`}>
            
            {/* Kamuból felső navigációs csík az előnézetben */}
            <div className="flex justify-between items-center border-b border-zinc-900/80 pb-4">
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="Kennel Logo" className="h-6 object-contain" onError={(e) => { (e.target as HTMLElement).style.display='none'; }} />
                ) : (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: accent }}>🐾</div>
                )}
                <span className="font-bold text-sm text-white">Royal Kennel OS</span>
              </div>
              <div className="flex gap-2 font-sans">
                <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
                <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
              </div>
            </div>

            {/* Kamu tartalom */}
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">Üdvözöljük a kenneledben!</h2>
              <p className="text-zinc-400 text-[11px] leading-relaxed">Ez egy minta szöveg, amely megmutatja, hogyan fognak kinézni a betűk, a színek és az elrendezések az éles felületeden.</p>
            </div>

            {/* Minta gombok és kártyák */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider">Aktív Kutyák</span>
                <div className="text-lg font-bold text-white" style={{ color: accent }}>14 db</div>
              </div>
              <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 space-y-1">
                <span className="text-zinc-500 text-[9px] uppercase tracking-wider">Idei Almok</span>
                <div className="text-lg font-bold text-white">3 alom</div>
              </div>
            </div>

            <button className="w-full text-center py-2 rounded-lg font-bold text-black text-[11px]" style={{ backgroundColor: accent }}>
              Minta Interaktív Gomb
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

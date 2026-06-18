"use client";

import { useTransition, useState } from "react";

interface BrandingSettings {
  accent_color: string;
  bg_style: string;
  font_family: string;
  logo_url: string | null;
  kennel_name: string;
  owner_name: string;
  kennel_address: string;
  tax_number: string;
  icon_style: string;
}

interface BrandingClientProps {
  settings: BrandingSettings;
  saveBrandingAction: (formData: FormData) => Promise<void>;
}

export default function BrandingClient({ settings, saveBrandingAction }: BrandingClientProps) {
  const [isPending, startTransition] = useTransition();

  const [accent, setAccent] = useState(settings.accent_color);
  const [bgStyle, setBgStyle] = useState(settings.bg_style);
  const [font, setFont] = useState(settings.font_family);
  const [logo, setLogo] = useState(settings.logo_url || "");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [iconStyle, setIconStyle] = useState(settings.icon_style || "minimal");

  const getBgClass = (style: string) => {
    if (style === "pitch-black") return "bg-black border-zinc-900";
    if (style === "slate") return "bg-slate-950 border-slate-900";
    return "bg-zinc-950 border-zinc-900";
  };

  const getFontClass = (fontFamily: string) => {
    if (fontFamily === "mono") return "font-mono";
    if (fontFamily === "serif") return "font-serif";
    return "font-sans";
  };

  return (
    <div className="space-y-8 text-white text-xs max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">White-Label & Teljes Arculat</h1>
        <p className="text-zinc-500 text-xs mt-1">Szabd személyre a szoftver nevesítését, dokumentum adatait és prémium vizuális stílusát.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Bal oldal: Beállítások form */}
        <form action={(fd) => startTransition(async () => { await saveBrandingAction(fd); alert("Arculati és kennel adatok elmentve!"); })} className="lg:col-span-3 space-y-6 bg-zinc-950 border border-zinc-800 p-6 rounded-xl">
          
          {/* SZEKCIÓ 1: KENNEL IDENTITÁS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-900 pb-2">🏨 Kennel Identitás & Megjelenés</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Kennel Hivatalos Neve</label>
                <input name="kennel_name" type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Egyedi Kísérőszín</label>
                <div className="flex gap-2 items-center">
                  <input type="color" name="accent_color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded" />
                  <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-center w-full text-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 font-bold">Saját Logó Kép URL címe</label>
              <input name="logo_url" type="url" placeholder="https://pelda.hu/logo.png" value={logo} onChange={(e) => setLogo(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white font-mono text-xs" />
            </div>
          </div>

          {/* SZEKCIÓ 2: PRÉMIUM STÍLUSOK */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-900 pb-2">🎨 Prémium Vizuális Stílus</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Sötét mód témája</label>
                <select name="bg_style" value={bgStyle} onChange={(e) => setBgStyle(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white">
                  <option value="zinc">Midnight Zinc</option>
                  <option value="slate">Deep Slate</option>
                  <option value="pitch-black">Pitch Black</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Betűtípus</label>
                <select name="font_family" value={font} onChange={(e) => setFont(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white">
                  <option value="sans">Modern Sans</option>
                  <option value="mono">Developer Mono</option>
                  <option value="serif">Elegant Serif</option>
                </select>
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Menü Ikonok Stílusa</label>
                <select name="icon_style" value={iconStyle} onChange={(e) => setIconStyle(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white">
                  <option value="minimal">Letisztult fehér</option>
                  <option value="neon">Izzó Neon színű</option>
                  <option value="glass-box">Színes dobozos (Prémium)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SZEKCIÓ 3: DOKUMENTUM GENERÁTOR ADATOK */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-zinc-900 pb-2">📄 Hivatalos Adatok (Szerződésekhez & PDF-ekhez)</h3>
            <p className="text-zinc-500 text-[10px] -mt-2">Ezeket az adatokat használja a rendszer az adásvételi szerződések és egészségügyi papírok generálásakor.</p>
            <div>
              <label className="text-zinc-400 block mb-1">Tulajdonos / Tenyésztő teljes neve</label>
              <input name="owner_name" type="text" defaultValue={settings.owner_name} placeholder="Kovács Anna" className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Hivatalos Székhely / Cím</label>
                <input name="kennel_address" type="text" defaultValue={settings.kennel_address} placeholder="1051 Budapest, Petőfi u. 4." className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Adószám / Kamarai szám (Opcionális)</label>
                <input name="tax_number" type="text" defaultValue={settings.tax_number} placeholder="12345678-1-42" className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="w-full rounded-lg py-3 font-bold text-black uppercase tracking-wider text-xs transition-all" style={{ backgroundColor: accent }}>
            {isPending ? "Mentés..." : "🚀 Változtatások Élesítése és Alkalmazása"}
          </button>
        </form>

        {/* Jobb oldal: ÉLŐ ELŐNÉZET DOBOZ */}
        <div className="lg:col-span-2 space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">✨ Dinamikus Élő Előnézet</span>
          <div className={`border p-6 rounded-2xl shadow-2xl space-y-6 transition-all duration-300 ${getBgClass(bgStyle)} ${getFontClass(font)}`}>
            
            {/* Navigáció mintája */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-6 object-contain" onError={(e) => { (e.target as HTMLElement).style.display='none'; }} />
                ) : (
                  <span className="text-xs" style={{ color: accent }}>🐾</span>
                )}
                <span className="font-bold text-xs text-white">{kennelName}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Welcome back, Anna! 👋</span>
            </div>

            {/* Ikon stílus előnézet doboz */}
            <div className="space-y-2">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Menü ikon stílus minta:</span>
              <div className="flex gap-4 p-2 bg-zinc-900/30 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-2">
                  {iconStyle === "minimal" && <span style={{ color: accent }}>🐕 Kutyák</span>}
                  {iconStyle === "neon" && <span className="p-1 font-bold rounded" style={{ color: accent, textShadow: `0 0 8px ${accent}` }}>🐕 Kutyák</span>}
                  {iconStyle === "glass-box" && (
                    <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-lg border border-zinc-800">
                      <span className="p-1 rounded text-white text-xs" style={{ backgroundColor: accent }}>🐕</span>
                      <span className="font-bold text-white">Kutyák</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kártyák minta */}
            <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 space-y-2">
              <h4 className="text-white font-bold">Pénzügyi áttekintés</h4>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div className="h-full" style={{ width: "70%", backgroundColor: accent }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

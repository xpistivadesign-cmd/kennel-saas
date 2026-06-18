"use client";

import { useTransition, useState } from "react";

interface BrandingSettings {
  accent_color: string;
  bg_color: string;
  google_font_name: string;
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
  const [bgColor, setBgColor] = useState(settings.bg_color || "#09090b");
  const [fontName, setFontName] = useState(settings.google_font_name || "Inter");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");
  const [iconStyle, setIconStyle] = useState(settings.icon_style || "minimal");
  const [previewLogo, setPreviewLogo] = useState<string | null>(settings.logo_url);

  const getContrastYIQ = (hexcolor: string) => {
    const hex = hexcolor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? "text-black" : "text-white";
  };

  const previewTextColor = getContrastYIQ(bgColor);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 text-white text-xs max-w-6xl mx-auto">
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;700;900&display=swap`} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Végtelen Arculati Szabadság</h1>
        <p className="text-zinc-500 text-xs mt-1">Töltsd fel a saját logódat, használj tetszőleges háttér- és kísérőszínt, vagy válassz a több ezer Google Font közül.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* JAVÍTOTT FORM: Bekerült az encType a sikeres fájlküldéshez */}
        <form 
          encType="multipart/form-data"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              await saveBrandingAction(fd);
              alert("Minden módosítás sikeresen alkalmazva lett!");
            });
          }}
          className="lg:col-span-3 space-y-6 bg-zinc-950 border border-zinc-800 p-6 rounded-xl"
        >
          <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider border-b border-zinc-900 pb-2">🏨 Kennel Identitás</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Kennel Hivatalos Neve</label>
                <input name="kennel_name" type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Logó Feltöltése (Telefonról/Gépől)</label>
                <input 
                  type="file" 
                  name="logo_file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-zinc-900 pb-2">🎨 Színek & Tipográfia</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Egyedi Kísérőszín</label>
                <div className="flex gap-2 items-center">
                  <input type="color" name="accent_color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded" />
                  <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-center w-full text-white text-[10px]" />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Tetszőleges Háttérszín</label>
                <div className="flex gap-2 items-center">
                  <input type="color" name="bg_color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded" />
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="bg-black border border-zinc-800 rounded-lg p-2 font-mono text-center w-full text-white text-[10px]" />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1 font-bold">Google Font Neve</label>
                <input 
                  name="google_font_name" 
                  type="text" 
                  value={fontName} 
                  onChange={(e) => setFontName(e.target.value)} 
                  placeholder="Pl. Poppins, Roboto, Inter"
                  className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white font-sans text-xs" 
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Ikonok Stílusa</label>
              <select name="icon_style" value={iconStyle} onChange={(e) => setIconStyle(e.target.value)} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white">
                <option value="minimal">Letisztult stílus</option>
                <option value="neon">Izzó Neon</option>
                <option value="glass-box">Színes dobozos (Prémium)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider border-b border-zinc-900 pb-2">📄 Hivatalos Dokumentum Adatok</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Tenyésztő / Tulajdonos Neve</label>
              <input name="owner_name" type="text" defaultValue={settings.owner_name} placeholder="Sz Krisztina" className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Székhely Cím</label>
                <input name="kennel_address" type="text" defaultValue={settings.kennel_address} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Adószám</label>
                <input name="tax_number" type="text" defaultValue={settings.tax_number} className="w-full rounded-lg bg-black border border-zinc-800 p-2.5 text-white" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={isPending} className="w-full rounded-lg py-3 font-bold text-black uppercase tracking-wider text-xs transition-all" style={{ backgroundColor: accent }}>
            {isPending ? "Fájlok feltöltése és mentése..." : "🚀 Teljes Arculat Alkalmazása"}
          </button>
        </form>

        {/* Előnézet */}
        <div className="lg:col-span-2 space-y-3 sticky top-6">
          <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">✨ Valós Idejű Előnézet</span>
          <div 
            className="border p-6 rounded-2xl shadow-2xl space-y-6 border-zinc-800/40 transition-all duration-200" 
            style={{ backgroundColor: bgColor, fontFamily: `'${fontName}', sans-serif` }}
          >
            <div className="flex justify-between items-center border-b border-zinc-800/40 pb-4">
              <div className="flex items-center gap-2">
                {previewLogo ? (
                  <img src={previewLogo} alt="Logo" className="h-6 max-w-[120px] object-contain" />
                ) : (
                  <span className="text-xs" style={{ color: accent }}>🐾</span>
                )}
                <span className={`font-bold text-xs ${previewTextColor}`}>{kennelName}</span>
              </div>
              <span className={`text-[10px] font-mono opacity-80 ${previewTextColor}`}>Welcome back! 👋</span>
            </div>

            <div className="space-y-2">
              <h2 className={`text-xl font-black ${previewTextColor}`}>Így néz ki a kenneled.</h2>
              <p className={`text-[11px] opacity-70 leading-relaxed ${previewTextColor}`}>A szövegek kontrasztja automatikusan igazodik a háttérhez, akár sötét, akár tiszta világos módot választasz.</p>
            </div>

            <div className="flex gap-4 p-3 bg-zinc-900/10 rounded-xl border border-zinc-800/40">
              {iconStyle === "minimal" && <span className={previewTextColor}>🐕 Kutyák listája</span>}
              {iconStyle === "neon" && <span className="font-bold" style={{ color: accent, textShadow: `0 0 8px ${accent}` }}>🐕 Kutyák listája</span>}
              {iconStyle === "glass-box" && (
                <div className="flex items-center gap-2 bg-zinc-800/20 p-1.5 rounded-lg border border-zinc-700/30">
                  <span className="p-1 rounded text-white text-xs" style={{ backgroundColor: accent }}>🐕</span>
                  <span className={`font-bold ${previewTextColor}`}>Kutyák</span>
                </div>
              )}
            </div>

            <button className="w-full text-center py-2 rounded-lg font-bold text-black text-[11px]" style={{ backgroundColor: accent }}>
              Interaktív Gomb Stílus
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

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

// Prémium SaaS és Luxus betűtípus gyűjtemény
const PREMIUM_FONTS = [
  { name: "Inter", desc: "Modern & Letisztult (SaaS Alapértelmezett)" },
  { name: "Poppins", desc: "Geometrikus & Fiatalos" },
  { name: "Montserrat", desc: "Elegáns & Határozott" },
  { name: "Playfair Display", desc: "Luxus Serif (Klasszikus prémium)" },
  { name: "Cinzel", desc: "Királyi & Tradicionális (Royal stílus)" },
  { name: "Roboto", desc: "Technikai & Letisztult" },
  { name: "Lora", desc: "Lágy & Elegáns regényes" },
  { name: "Fira Code", desc: "Karakteres fejlesztői (Monospace)" }
];

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
        <p className="text-zinc-500 text-xs mt-1">Töltsd fel a saját logódat, használj tetszőleges háttér- és kísérőszínt, vagy válassz a prémium betűtípusok közül.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
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
                  className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800

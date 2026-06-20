"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BrandingSettings = {
  theme_mode: string;
  preset_palette: string;
  primary_color: string;
  accent_color: string;
  bg_color: string;
  card_color: string;
  text_heading_color: string;
  text_body_color: string;
  ui_style: string;
  ui_radius: string;
  ui_animation: string;
  ui_font: string;
  kennel_name: string;
  owner_name: string;
  kennel_address: string;
  tax_number: string;
  logo_url: string | null;
};

type Props = {
  settings: BrandingSettings;
  saveBrandingAction: (fd: FormData) => Promise<void>;
};

const PALETTES = [
  { id: "midnight", name: "Midnight Neon", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#090A0F" },
  { id: "aurora", name: "Aurora", primary: "#6D28D9", accent: "#22D3EE", bg: "#030712", card: "#111827" },
  { id: "electric", name: "Electric", primary: "#4F46E5", accent: "#00FFA3", bg: "#050505", card: "#111111" },
  { id: "royal", name: "Royal", primary: "#D4AF37", accent: "#FFF4CC", bg: "#080808", card: "#181818" },
  { id: "lime", name: "Violet Lime", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#101010" },
  { id: "custom", name: "Custom Builder", primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", card: "#090A0F" },
];

export default function BrandingClient({ settings, saveBrandingAction }: Props) {
  const router = useRouter();
  
  // ⚡ A useTransition helyett manuális állapottal kezeljük a fagyás elkerülésére
  const [isSaving, setIsSaving] = useState(false);

  const [themeMode, setThemeMode] = useState(settings.theme_mode ?? "dark");
  const [palette, setPalette] = useState(settings.preset_palette ?? "midnight");
  
  const [primary, setPrimary] = useState(settings.primary_color ?? "#7D39EB");
  const [accent, setAccent] = useState(settings.accent_color ?? "#C6FF33");
  const [bg, setBg] = useState(settings.bg_color ?? "#000000");
  const [card, setCard] = useState(settings.card_color ?? "#090A0F");
  const [textHeading, setTextHeading] = useState(settings.text_heading_color || "#FFFFFF");
  const [textBody, setTextBody] = useState(settings.text_body_color || "#A1A1AA");

  const [style, setStyle] = useState(settings.ui_style ?? "glass");
  const [radius, setRadius] = useState(settings.ui_radius ?? "medium");
  const [animation, setAnimation] = useState(settings.ui_animation ?? "normal");
  const [font, setFont] = useState(settings.ui_font || "inter");
  const [kennelName, setKennelName] = useState(settings.kennel_name || "Saját Kennel");

  function selectPalette(id: string) {
    setPalette(id);
    const p = PALETTES.find((x) => x.id === id);
    if (!p || id === "custom") return;

    setPrimary(p.primary);
    setAccent(p.accent);
    setBg(themeMode === "light" ? "#FFFFFF" : p.bg);
    setCard(p.card);
  }

  // ⚡ TISZTA, AKCIÓ ALAPÚ BEKÜLDÉS - SEMMI USETRANSITION NYUGALOM!
  async function handleFormAction(formData: FormData) {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // Szinkronizáljuk a React State változókat a FormData objektumba az utolsó pillanatban
      formData.set("theme_mode", themeMode);
      formData.set("preset_palette", palette);
      formData.set("primary_color", primary);
      formData.set("accent_color", accent);
      formData.set("bg_color", bg);
      formData.set("card_color", card);
      formData.set("text_heading_color", textHeading);
      formData.set("text_body_color", textBody);
      formData.set("ui_style", style);
      formData.set("ui_radius", radius);
      formData.set("ui_animation", animation);
      formData.set("ui_font", font);
      formData.set("kennel_name", kennelName);

      // Közvetlen szerveroldali hívás
      await saveBrandingAction(formData);
      
      router.refresh();
      // Hard reload, ami kényszeríti a layout.tsx-et a tokenek azonnali beolvasására
      window.location.reload();
    } catch (err) {
      console.error("Kritikus hiba mentéskor:", err);
      alert("Hiba lépett fel az arculat frissítésekor.");
      setIsSaving(false);
    }
  }

  return (
    <form action={handleFormAction} className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-black">Appearance & Architecture Control</h1>
        <p className="opacity-60">Személyre szabott betűtípusok, egyedi betűszínek és white-label konfiguráció.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          
          {/* TÖRZSDATOK */}
          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <h3 className="font-bold text-amber-400">🏢 Kennel Alapadatok</h3>
            <div>
              <label className="text-[11px] block mb-1">Kennel Megjelenítési Neve</label>
              <input type="text" value={kennelName} onChange={(e) => setKennelName(e.target.value)} className="w-full p-3 bg-black rounded-xl text-white border border-zinc-800" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] block mb-1">Logó Feltöltése</label>
                <input type="file" name="logo_file" accept="image/*" className="w-full p-2 bg-black rounded-xl text-zinc-400 border border-zinc-800 cursor-pointer" />
                <input type="hidden" name="current_logo_url" value={settings.logo_url || ""} />
              </div>
              <div>
                <label className="text-[11px] block mb-1">Tenyésztő Neve</label>
                <input type="text" name="owner_name" defaultValue={settings.owner_name} className="w-full p-3 bg-black rounded-xl text-white border border-zinc-800" />
              </div>
            </div>
          </div>

          {/* ALAP MÓDOK */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Theme Mode</h3>
              <select value={themeMode} onChange={(e) => setThemeMode(e.target.value)} className="w-full p-3 bg-black rounded-xl border border-zinc-800 text-white">
                <option value="dark">dark</option>
                <option value="light">light</option>
                <option value="system">system</option>
              </select>
            </div>
            <div>
              <h3 className="font-bold mb-2">Betűtípus (10 Prémium Google Font)</h3>
              <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full p-3 bg-black rounded-xl border border-zinc-800 text-white">
                <option value="inter">Inter (Letisztult modern)</option>
                <option value="poppins">Poppins (Geometrikus tech)</option>
                <option value="cinzel">Cinzel (Luxus Serif)</option>
                <option value="montserrat">Montserrat (Prémium széles)</option>
                <option value="outfit">Outfit (Lágy lekerekített)</option>
                <option value="manrope">Manrope (Karakteres szoftveres)</option>
                <option value="playfair">Playfair Display (Elegáns serif)</option>
                <option value="roboto">Roboto (Klasszikus gyári)</option>
                <option value="oswald">Oswald (Vastag tömörített)</option>
                <option value="ubuntu">Ubuntu (Lágy íves)</option>
              </select>
            </div>
          </div>

          {/* PALETTÁK */}
          <div>
            <h3 className="font-bold mb-3">Márka Paletták</h3>
            <div className="grid grid-cols-2 gap-3">
              {PALETTES.map((p) => (
                <button key={p.id} type="button" onClick={() => selectPalette(p.id)} className={`rounded-2xl p-4 border text-left transition-all ${palette === p.id ? "border-purple-500 bg-zinc-900" : "border-zinc-800 bg-black"}`}>
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full" style={{ background: p.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: p.accent }} />
                  </div>
                  <div className="mt-2 font-bold text-xs">{p.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM BUILDER */}
          {palette === "custom" && (
            <div className="p-4 bg-black rounded-xl border border-zinc-900 space-y-3 animate-slideDown">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] block mb-0.5">Primary (Violet)</label><input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Accent (Lime)</label><input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2">
                <div><label className="text-[10px] block mb-0.5">Háttérszín</label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">Kártya Alapszín</label><input type="color" value={card} onChange={(e) => setCard(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 pt-2">
                <div><label className="text-[10px] block mb-0.5">✍️ Főcímek betűszíne</label><input type="color" value={textHeading} onChange={(e) => setTextHeading(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
                <div><label className="text-[10px] block mb-0.5">📝 Leírások betűszíne</label><input type="color" value={textBody} onChange={(e) => setTextBody(e.target.value)} className="w-full h-8 bg-transparent cursor-pointer" /></div>
              </div>
            </div>
          )}

          {/* EFFEKT TUNING */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold block mb-1">STYLE</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="flat">flat</option>
                <option value="glass">glass (üveghatás)</option>
                <option value="neon">neon (izzás)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1">RADIUS</label>
              <select value={radius} onChange={(e) => setRadius(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="sharp">sharp</option>
                <option value="medium">medium</option>
                <option value="soft">soft</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold block mb-1">ANIMATION</label>
              <select value={animation} onChange={(e) => setAnimation(e.target.value)} className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white">
                <option value="minimal">minimal</option>
                <option value="normal">normal</option>
                <option value="dynamic">dynamic</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl bg-lime-300 text-black font-black uppercase tracking-wider text-xs transition-all hover:opacity-95 flex items-center justify-center gap-2">
            {isSaving ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full"></span>
                Rendszer frissítése...
              </>
            ) : "🚀 ARCULATI STRATÉGIA ÉLESÍTÉSE"}
          </button>

        </section>

        {/* PREVIEW */}
        <section className="sticky top-6">
          <div className="rounded-[32px] p-8 border border-white/10" style={{ background: `linear-gradient(135deg, ${primary}22, ${accent}11)` }}>
            <div className="rounded-3xl p-6 border" style={{ backgroundColor: card, borderColor: "rgba(255,255,255,0.05)" }}>
              <h2 className="text-xl font-black mb-4" style={{ color: textHeading }}>🐾 {kennelName}</h2>
              <div className="grid gap-3">
                <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg, ${primary}25, ${primary}05)`, color: textBody }}>Kártya Szövegszín Előnézet</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}

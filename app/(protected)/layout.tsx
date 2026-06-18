import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Biztonságos, szerveroldali másolat a 12 prémium témáról, hogy ne kelljen Kliens fájlból importálni!
const SERVER_BRANDING_PRESETS = {
  royal_gold: { name: "Royal Gold (Luxus)", bg: "#09090B", primary: "#D4A45A", accent: "#F4D58D" },
  obsidian_platinum: { name: "Obsidian Platinum (Gyári)", bg: "#0A0B0F", primary: "#E5E7EB", accent: "#8B8D98" },
  midnight_sapphire: { name: "Midnight Sapphire", bg: "#081224", primary: "#3B82F6", accent: "#60A5FA" },
  emerald_prestige: { name: "Emerald Prestige", bg: "#08130D", primary: "#22C55E", accent: "#86EFAC" },
  imperial_purple: { name: "Imperial Purple", bg: "#0E081A", primary: "#7C3AED", accent: "#C084FC" },
  bordeaux_velvet: { name: "Bordeaux Velvet", bg: "#14070B", primary: "#A11A4B", accent: "#F472B6" },
  arctic_ice: { name: "Arctic Ice", bg: "#0F172A", primary: "#E2E8F0", accent: "#67E8F9" },
  copper_heritage: { name: "Copper Heritage", bg: "#15100C", primary: "#C96A2B", accent: "#F59E0B" },
  carbon_red: { name: "Carbon Red (Sport)", bg: "#09090B", primary: "#DC2626", accent: "#F87171" },
  forest_elite: { name: "Forest Elite", bg: "#07100A", primary: "#2E7D32", accent: "#81C784" },
  sandstone_luxury: { name: "Sandstone Luxury", bg: "#12100D", primary: "#E7CFA4", accent: "#C19A6B" },
  graphite_monochrome: { name: "Graphite Monochrome", bg: "#09090B", primary: "#FFFFFF", accent: "#71717A" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const branding = brandingData?.[0] || null;

  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "obsidian_platinum";
  
  // Kiválasztjuk a megfelelő gyári palettát a szerveroldali listából
  const presetData = SERVER_BRANDING_PRESETS[currentPresetKey as keyof typeof SERVER_BRANDING_PRESETS] || SERVER_BRANDING_PRESETS.obsidian_platinum;

  // SZIGORÚ 3-SZÍNES STRUKTÚRA KISZÁMÍTÁSA ÉS KÉNYSZERÍTÉSE
  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#0A0B0F");
  const headingColor = isPreset ? presetData.primary : "#FFFFFF"; 
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#8B8D98");
  const bodyColor = `${headingColor}cc`; // 80%-os áttetsző elegáns szövegszín

  const googleFontName = branding?.google_font_name || "Inter";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "glass-box";
  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || "Tenyésztő";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dogs", label: "Dogs", icon: "🐕" },
    { href: "/heats", label: "Heats", icon: "🩸" },
    { href: "/litters", label: "Litters", icon: "🐾" },
    { href: "/shows", label: "Shows", icon: "🏆" },
    { href: "/buyers", label: "Buyers & Waitlist", icon: "👥" },
    { href: "/finance", label: "Finance", icon: "💰" },
    { href: "/settings/branding", label: "Branding & Style", icon: "🎨" },
  ];

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex transition-all duration-300" style={{ backgroundColor: bgColor, color: bodyColor, fontFamily: `'${googleFontName}', sans-serif` }}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;600;900&display=swap`} />

      {/* 🚀 APPLE-STYLE MATEMATIKAI 3-SZÍNES ARCULATI INJEKCIÓ */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, html { background-color: ${bgColor} !important; }
        h1, h2, h3, h4, th, .text-white, strong, b { color: ${headingColor} !important; }
        p, span, td, label, li, .text-zinc-400, .text-zinc-300 { color: ${bodyColor} !important; }

        /* Globális akciógombok a kiválasztott Accent színnel */
        button[type="submit"], .bg-emerald-500, .bg-blue-500, .bg-blue-600, .bg-zinc-100, 
        button:contains("+"), button:contains("MENTÉS"), button[className*="bg-emerald"], .bg-amber-500 {
          background-color: ${accentColor} !important;
          color: ${bgColor} !important;
          font-weight: 900 !important;
          border: none !important;
          box-shadow: 0 4px 24px ${accentColor}33 !important;
        }

        /* 🪐 100% AUTOMATIZÁLT LUXUS KÁRTYÁK (A fényszín 4%-os vetülete, így bármilyen palettánál gyönyörű marad) */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .bg-zinc-800\\/50, .rounded-xl.border, .border-zinc-800 {
          background-color: ${headingColor}0a !important;
          border: 1px solid ${headingColor}12 !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 0 4px 35px rgba(0,0,0,0.15) !important;
        }

        /* Finom hover effektus */
        .bg-zinc-900:hover, .rounded-xl.border:hover {
          background-color: ${headingColor}0f !important;
          border-color: ${accentColor}44 !important;
          transform: translateY(-2px);
        }

        /* 🔲 PRÉMIUM KONTÚROS IKON BOXOK DESIGN */
        aside span[className*="rounded-lg"], main span[className*="bg-zinc-900"] {
          background-color: ${accentColor}15 !important;
          border: 1px solid ${accentColor}30 !important;
          color: ${accentColor} !important;
        }

        /* Input mezők és beviteli panelek */
        input, select, textarea {
          background-color: rgba(0,0,0,0.25) !important;
          border: 1px solid ${headingColor}15 !important;
          color: ${headingColor} !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${accentColor} !important;
        }
      `}} />

      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: `${headingColor}0d` }}>
        <div>
          {/* LOGÓ VAGY SZÖVEGES BRANDING */}
          <div className="mb-8 flex items-center gap-2 border-b pb-4" style={{ borderColor: `${headingColor}0d` }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain rounded" />
            ) : (
              <span className="text-lg font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* FIXÁLT ÜDVÖZLŐ DOBOZ A MENTETT TENYÉSZTŐ NEVÉVEL */}
          <div className="mb-6 p-3.5 rounded-xl border text-xs font-bold" style={{ backgroundColor: `${headingColor}04`, borderColor: `${headingColor}0d` }}>
            <span className="text-[9px] block uppercase tracking-wider opacity-40">Tenyészet</span>
            <div className="text-xs font-black mt-0.5" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}!</div>
          </div>

          {/* MENÜPONTOK */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all hover:bg-white/5">
                {iconStyle === "glass-box" ? (
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}25`, color: accentColor }}>{item.icon}</span>
                ) : (
                  <span>{item.icon}</span>
                )}
                <span className="font-bold" style={{ color: headingColor }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full p-2.5 rounded-xl border text-xs font-bold transition-all" style={{ backgroundColor: `${headingColor}04`, borderColor: `${headingColor}0d`, color: headingColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

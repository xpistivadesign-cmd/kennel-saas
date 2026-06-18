import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  royal_purple: { bg: "#1e113a", accent: "#eab308", heading: "#ffffff", body: "#f3e8ff" },
  midnight_neon: { bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa" },
  luxury_gold: { bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa" },
  soft_beige: { bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Biztonságos lekérdezés
  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // HA AZ ADATBÁZIS ÜRES VAGY HIBÁS, AKKOR IS LEGYEN EGY ALAPÉRTELMEZETT PRESET (Pl. royal_purple)
  const currentPresetKey = branding?.preset_palette || "royal_purple";
  const themeMode = branding?.theme_mode || "preset";
  const isPreset = themeMode === "preset";
  
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.royal_purple;

  // Golyóálló szín-kiválasztás (Ha a custom szín üres vagy hibás, azonnal a preset lép életbe)
  const bgColor = (isPreset || !branding?.bg_color || branding.bg_color === "undefined" || branding.bg_color === "#000000") 
    ? presetData.bg 
    : branding.bg_color;

  const accentColor = (isPreset || !branding?.accent_color || branding.accent_color === "undefined" || branding.accent_color === "#000000") 
    ? presetData.accent 
    : branding.accent_color;

  const headingColor = (isPreset || !branding?.text_heading_color || branding.text_heading_color === "undefined") 
    ? presetData.heading 
    : branding.text_heading_color;

  const bodyColor = (isPreset || !branding?.text_body_color || branding.text_body_color === "undefined") 
    ? presetData.body 
    : branding.text_body_color;

  const googleFontName = branding?.google_font_name || "Inter";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "minimal";

  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

  // Light/Dark mód kiszámítása a kontraszthoz
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const isLight = yiq >= 128;

  // Szuper-látható, valódi üveghatású kártya hátterek kontrasztosan
  const cardOverlay = isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.06)";
  const borderOverlay = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";

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
    <div className="min-h-screen flex transition-all duration-200" style={{ backgroundColor: bgColor, color: bodyColor, fontFamily: `'${googleFontName}', sans-serif` }}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;500;700;900&display=swap`} />

      {/* 🔮 MAXIMÁLISAN AGRESSZÍV CSS FELÜLBÍRÁLÁS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Szövegek kényszerítése az arculat színeire */
        h1, h2, h3, h4, th, .text-white, strong, [className*="text-zinc-100"], [className*="text-zinc-200"] { color: ${headingColor} !important; }
        p, span, td, label, .text-zinc-400, [className*="text-zinc-400"], [className*="text-zinc-300"] { color: ${bodyColor} !important; }
        
        /* 1. AKCIÓGOMBOK ÉS KÍSÉRŐSZÍN RENDZSER (Mentés, Új hozzáadása, stb) */
        button[type="submit"]:not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500, .bg-lime-500, .bg-emerald-400,
        button:contains("+"), button:contains("MENTÉS"), a[href*="new"], a[href*="create"],
        [className*="bg-emerald-500"], [className*="bg-blue-600"] { 
          background-color: ${accentColor} !important; 
          color: ${isLight ? '#000000' : '#ffffff'} !important;
          border-color: ${accentColor} !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 24px ${accentColor}50 !important;
        }

        /* 2. VALÓDI ÜVEGHATÁSÚ ALAP KÁRTYÁK (Minden Tailwind sötét hátteret brutálisan felülírunk) */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .bg-zinc-900\\/50,
        div[className*="bg-zinc-900"], div[className*="bg-black"], div[className*="bg-zinc-950"],
        .rounded-xl.border, .rounded-2xl.border, [className*="rounded-xl border"] {
          background-color: ${cardOverlay} !important;
          border-color: ${borderOverlay} !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* 3. DINAMIKUS HOVER EFFEKTUS */
        .bg-zinc-950:hover, .bg-zinc-900:hover, .bg-black:hover, .rounded-xl.border:hover, div[className*="bg-zinc-900"]:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.3) !important;
          border-color: ${accentColor}60 !important;
        }

        /* 4. FIGYELMEZTETŐ / KÖZELGŐ ESEMÉNYEK KÁRTYÁI */
        div:contains("⚠️"), div:contains("SÜRGŐS"), div:contains("Optimal") {
          background-color: ${isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.07)'} !important;
          border-left: 4px solid #f59e0b !important;
          border-color: rgba(245, 158, 11, 0.3) !important;
        }

        /* 5. FINANCES KÁRTYÁK (Smaragdzöld derengés) */
        div:contains("Income"), div:contains("Total Income"), div:contains("Revenue") {
          background-color: ${isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.07)'} !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
        }

        /* 6. KIADÁSOK / SZUKÁK / TÜZELÉSEK (Tűzpiros / Magenta derengés) */
        div:contains("Expense"), div:contains("Total Expense"), div:contains("Heats"), div:contains("🔴"), div:contains("Female") {
          background-color: ${isLight ? 'rgba(244, 63, 94, 0.12)' : 'rgba(244, 63, 94, 0.07)'} !important;
          border-color: rgba(244, 63, 94, 0.3) !important;
        }

        /* 7. KAN KUTYÁK (Prémium kék derengés) */
        div:contains("Male") {
          background-color: ${isLight ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.07)'} !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
        
        /* Input mezők formázása */
        input, select, textarea { 
          background-color: ${isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.4)'} !important; 
          color: ${headingColor} !important; 
          border-color: ${borderOverlay} !important; 
        }
      `}} />

      <aside className="w-64 shrink-0 border-r flex flex-col justify-between p-6" style={{ backgroundColor: bgColor, borderColor: borderOverlay }}>
        <div>
          {/* LOGÓ SZEKCIÓ */}
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b pb-4" style={{ borderColor: borderOverlay }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[180px] object-contain rounded" />
            ) : (
              <span className="text-base font-black flex items-center gap-1.5" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* ÜDVÖZLŐ DOBOZ */}
          <div className="rounded-xl border mb-6 p-3" style={{ backgroundColor: cardOverlay, borderColor: borderOverlay }}>
            <span className="text-[9px] block uppercase tracking-wider font-bold opacity-60">Tenyészet</span>
            <div className="text-xs font-bold mt-0.5" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}! 👋</div>
          </div>

          {/* NAVIGÁCIÓ */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-zinc-800/10 transition-all">
                {iconStyle === "minimal" && <span className="text-sm opacity-70">{item.icon}</span>}
                {iconStyle === "neon" && <span className="text-sm" style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{item.icon}</span>}
                {iconStyle === "glass-box" && (
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                    {item.icon}
                  </span>
                )}
                <span className="font-bold" style={{ color: headingColor }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 rounded-lg border text-xs transition-all" style={{ backgroundColor: cardOverlay, borderColor: borderOverlay, color: headingColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

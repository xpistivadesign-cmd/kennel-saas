import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  deep_burgundy: { bg: "#0E0D0D", heading: "#EEDCC1", body: "#A89A8D", card: "#EEDCC1", btnText: "#FFFFFF", accent: "#5E001A" },
  royal_navy: { bg: "#1F2A44", heading: "#E8DCC8", body: "#94A3B8", card: "#E8DCC8", btnText: "#000000", accent: "#C6A75E" },
  cyber_neon: { bg: "#0E48C1", heading: "#3DF8F8", body: "#E0A0FF", card: "#3DF8F8", btnText: "#FFFFFF", accent: "#E23AFB" },
  neon_lime: { bg: "#111217", heading: "#FEFFFC", body: "#94949E", card: "#FEFFFC", btnText: "#000000", accent: "#DDFF00" },
  behance_pastel: { bg: "#F5F5F5", heading: "#5A4EFF", body: "#4B5563", card: "#5A4EFF", btnText: "#FFFFFF", accent: "#EEA0FF" },
  travel_app: { bg: "#F5F5F5", heading: "#1F2937", body: "#6B7280", card: "#1F2937", btnText: "#000000", accent: "#E2F4A6" },
  royal_gold_dark: { bg: "#09090B", heading: "#D4A45A", body: "#A1A1AA", card: "#D4A45A", btnText: "#000000", accent: "#F4D58D" },
  imperial_purple: { bg: "#0E081A", heading: "#C084FC", body: "#A78BFA", card: "#C084FC", btnText: "#FFFFFF", accent: "#7C3AED" },
  bordeaux_velvet: { bg: "#14070B", heading: "#F472B6", body: "#FDA4AF", card: "#F472B6", btnText: "#FFFFFF", accent: "#A11A4B" },
  forest_elite: { bg: "#07100A", heading: "#81C784", body: "#A7F3D0", card: "#81C784", btnText: "#FFFFFF", accent: "#2E7D32" },
  sandstone_luxury: { bg: "#12100D", heading: "#E7CFA4", body: "#D1B894", card: "#E7CFA4", btnText: "#000000", accent: "#C19A6B" },
  graphite_monochrome: { bg: "#09090B", heading: "#FFFFFF", body: "#71717A", card: "#FFFFFF", btnText: "#000000", accent: "#FFFFFF" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const branding = brandingData?.[0] || null;

  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "deep_burgundy";
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.deep_burgundy;

  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#0A0B0F");
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#8B8D98");
  const headingColor = isPreset ? presetData.heading : (branding?.text_heading_color || "#FFFFFF");
  const bodyColor = isPreset ? presetData.body : (branding?.text_body_color || "#A1A1AA");
  const cardTextColor = isPreset ? presetData.card : (branding?.text_card_color || "#FFFFFF");
  const btnTextColor = isPreset ? presetData.btnText : (branding?.text_btn_color || "#000000");

  const googleFontName = branding?.google_font_name || "Inter";
  const kennelName = branding?.kennel_name || "Kennel OS";
  const logoUrl = branding?.logo_url || null;
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

      <style dangerouslySetInnerHTML={{ __html: `
        /* 🚨 RADIKÁLIS TAILWIND FELÜLÍRÓ RENDSZER */
        body, html, main, .min-h-screen, div[className*="bg-zinc-950"], div[className*="bg-black"] { 
          background-color: ${bgColor} !important; 
        }
        
        /* Címek és kiemelt elemek kényszerítése */
        h1, h2, h3, h4, th, .text-white, strong, b, [className*="text-zinc-100"], [className*="text-zinc-200"] { 
          color: ${headingColor} !important; 
        }
        
        /* Leírások és normál szövegek */
        p, span:not([className*="rounded-"]), label, li, td, [className*="text-zinc-400"], [className*="text-zinc-300"], [className*="text-gray-400"] { 
          color: ${bodyColor} !important; 
        }
        
        /* Gombok idomítása az accent színre */
        button[type="submit"], .bg-emerald-500, .bg-blue-600, .bg-purple-600, .bg-amber-500,
        button[className*="bg-"], [className*="bg-zinc-100"], a[className*="bg-amber"] {
          background-color: ${accentColor} !important;
          color: ${btnTextColor} !important;
          font-weight: 900 !important;
          border: none !important;
          box-shadow: 0 4px 20px ${accentColor}20 !important;
        }

        /* Luxus transzparens kártyák a főcímszín 6%-os tónusával */
        .bg-zinc-900, .bg-zinc-900\\/50, .bg-zinc-800, .border-zinc-800, div[className*="rounded-xl"] {
          background-color: ${headingColor}0a !important;
          border: 1px solid ${headingColor}12 !important;
        }
        
        /* Kártya szövegek színe */
        div[className*="rounded-xl"] span, div[className*="rounded-xl"] p, div[className*="rounded-2xl"] div {
          color: ${cardTextColor};
        }

        /* Beviteli panelek */
        input, select, textarea {
          background-color: ${headingColor}05 !important;
          border: 1px solid ${headingColor}1a !important;
          color: ${headingColor} !important;
        }
      `}} />

      {/* BAL MENÜSÁV */}
      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: `${headingColor}0d` }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b pb-4" style={{ borderColor: `${headingColor}0d` }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain rounded" />
            ) : (
              <span className="text-lg font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          <div className="mb-6 p-3.5 rounded-xl border text-xs font-bold" style={{ backgroundColor: `${headingColor}03`, borderColor: `${headingColor}0a` }}>
            <span className="text-[9px] block uppercase tracking-wider opacity-40" style={{ color: headingColor }}>Tenyészet</span>
            <div className="text-xs font-black mt-0.5" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}!</div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ backgroundColor: `${accentColor}12`, border: `1px solid ${accentColor}20`, color: accentColor }}>
                  {item.icon}
                </span>
                <span style={{ color: headingColor }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full p-2.5 rounded-xl border text-xs font-bold transition-all" style={{ backgroundColor: `${headingColor}03`, borderColor: `${headingColor}0d`, color: headingColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

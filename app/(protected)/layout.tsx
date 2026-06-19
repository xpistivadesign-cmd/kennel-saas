import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Szerveroldali biztonságos paletta-adatok (Nem importálunk klienstől!)
const SERVER_PRESETS = {
  obsidian_platinum: { name: "Obsidian Platinum (Mérnöki)", bg: "#0A0B0F", heading: "#E5E7EB", body: "#8B8D98", accent: "#8B8D98" },
  royal_gold: { name: "Royal Navy & Gold (Luxus)", bg: "#060B16", heading: "#E2D1B3", body: "#A2B3C6", accent: "#C6A675" },
  creme_burgundy: { name: "Creme & Deep Burgundy", bg: "#F4EFEA", heading: "#4A0E17", body: "#7A6865", accent: "#A11A4B" },
  cyber_neon: { name: "Cyberpunk Tech (Élénk)", bg: "#07040F", heading: "#00FFCC", body: "#EEA0FF", accent: "#5A4EFF" },
  swiss_emerald: { name: "Swiss Green (Letisztult)", bg: "#061310", heading: "#E2F4F0", body: "#789A93", accent: "#22C55E" },
  sandstone_cosy: { name: "Sandstone Beige (Meleg)", bg: "#151210", heading: "#E7CFA4", body: "#A19284", accent: "#C19A6B" },
  arctic_white: { name: "Arctic Minimal (Világos)", bg: "#F8FAFC", heading: "#0F172A", body: "#64748B", accent: "#06B6D4" },
  burnt_peach: { name: "Burnt Peach & Sage", bg: "#1A1512", heading: "#F4A27E", body: "#9FB1A5", accent: "#E67E22" },
  inkwell_eclipse: { name: "Inkwell Dark Chrome", bg: "#121318", heading: "#FFFFFF", body: "#71717A", accent: "#E2E8F0" },
  forest_heritage: { name: "Forest Prestige", bg: "#0B140F", heading: "#D1E7DD", body: "#748E81", accent: "#81C784" },
  monetto_flat: { name: "Monetto Terracotta", bg: "#FDFBF7", heading: "#EA2E00", body: "#5A6E72", accent: "#9DBDB8" },
  graphite_monochrome: { name: "Graphite Studio", bg: "#09090B", heading: "#FFFFFF", body: "#71717A", accent: "#FFFFFF" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const branding = brandingData?.[0] || null;

  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "obsidian_platinum";
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.obsidian_platinum;

  // Globális színek kinyerése
  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#0A0B0F");
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#8B8D98");
  
  // 3-Szintű Szövegszín kezelés
  const headingColor = isPreset ? presetData.heading : (branding?.text_heading_color || "#FFFFFF");
  const bodyColor = isPreset ? presetData.body : (branding?.text_body_color || "#A1A1AA");
  const cardTextColor = isPreset ? presetData.heading : (branding?.text_card_color || "#FFFFFF");

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

      <style dangerouslySetInnerHTML={{ __html: `
        body, html { background-color: ${bgColor} !important; }
        
        h1, h2, h3, h4, th, .text-white, strong, b { color: ${headingColor} !important; }
        p, span, label, li, .text-zinc-400, .text-zinc-300 { color: ${bodyColor} !important; }
        td, div[className*="rounded-xl"] span, div[className*="rounded-xl"] p { color: ${cardTextColor} !important; }

        button[type="submit"], .bg-emerald-500, .bg-blue-500, .bg-blue-600, .bg-zinc-100, 
        button:contains("+"), button:contains("MENTÉS"), button[className*="bg-emerald"], .bg-amber-500 {
          background-color: ${accentColor} !important;
          color: ${bgColor} !important;
          font-weight: 900 !important;
          border: none !important;
          box-shadow: 0 4px 24px ${accentColor}25 !important;
        }

        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .bg-zinc-800\\/50, .rounded-xl.border, .border-zinc-800 {
          background-color: ${headingColor}0d !important;
          border: 1px solid ${headingColor}15 !important;
          backdrop-filter: blur(24px) !important;
          box-shadow: 0 4px 30px rgba(0,0,0,0.08) !important;
        }

        .bg-zinc-900:hover, .rounded-xl.border:hover {
          background-color: ${headingColor}12 !important;
          border-color: ${accentColor}33 !important;
          transform: translateY(-2px);
        }

        aside span[className*="rounded-lg"], main span[className*="bg-zinc-900"] {
          background-color: ${accentColor}12 !important;
          border: 1px solid ${accentColor}25 !important;
          color: ${accentColor} !important;
        }

        input, select, textarea {
          background-color: ${headingColor}05 !important;
          border: 1px solid ${headingColor}15 !important;
          color: ${headingColor} !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${accentColor} !important;
        }
      `}} />

      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ backgroundColor: "rgba(0,0,0,0.1)", borderColor: `${headingColor}0d` }}>
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
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all hover:bg-white/5">
                {iconStyle === "glass-box" ? (
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ backgroundColor: `${accentColor}12`, border: `1px solid ${accentColor}20`, color: accentColor }}>{item.icon}</span>
                ) : (
                  <span>{item.icon}</span>
                )}
                <span className="font-bold" style={{ color: headingColor }}>{item.label}</span>
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

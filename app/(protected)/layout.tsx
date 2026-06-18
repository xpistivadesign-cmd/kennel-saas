import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PRESETS } from "./settings/branding/BrandingClient";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // STÍLUS ÉRTÉKEK MEGHATÁROZÁSA (PRESET VAGY CUSTOM)
  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "royal_purple";
  const presetData = PRESETS[currentPresetKey as keyof typeof PRESETS] || PRESETS.royal_purple;

  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#09090b");
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#3b82f6");
  const headingColor = isPreset ? presetData.heading : (branding?.text_heading_color || "#ffffff");
  const bodyColor = isPreset ? presetData.body : (branding?.text_body_color || "#a1a1aa");

  const googleFontName = branding?.google_font_name || "Inter";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "minimal";

  // 🛠️ FIX: ITT JAVÍTJUK A NEVEDET! Ha van elmentve owner_name, azt írja ki, ha nincs, a metadata-t!
  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

  // Kártya háttér árnyalás intelligensen
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  const cardBgColor = (yiq >= 128) ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
  const borderOverlay = (yiq >= 128) ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";

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
    <div 
      className="min-h-screen flex transition-all duration-200" 
      style={{ 
        backgroundColor: bgColor, 
        color: bodyColor,
        fontFamily: `'${googleFontName}', sans-serif`
      }}
    >
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;500;700;900&display=swap`} />

      {/* AGRESSZÍV CSS INJEKCIÓ A FELHASZNÁLÓ SZÍNEIVEL */}
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, th, .text-white, strong { color: ${headingColor} !important; }
        p, span, td, label, .text-zinc-400 { color: ${bodyColor} !important; }
        
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500, .bg-lime-500, 
        button:contains("+"), button:contains("MENTÉS") { 
          background-color: ${accentColor} !important; 
          color: ${yiq >= 128 ? '#000000' : '#ffffff'} !important;
          border-color: ${accentColor} !important;
        }

        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800,
        div[className*="bg-zinc-950"], div[className*="bg-black"],
        .rounded-xl.border, .rounded-2xl.border {
          background-color: ${cardBgColor} !important;
          border-color: ${borderOverlay} !important;
        }
        
        input, select, textarea { 
          background-color: rgba(0,0,0,0.2) !important; 
          color: ${headingColor} !important; 
          border-color: ${borderOverlay} !important; 
        }
      `}} />

      <aside className="w-64 shrink-0 border-r flex flex-col justify-between p-6" style={{ backgroundColor: bgColor, borderColor: borderOverlay }}>
        <div>
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b pb-4" style={{ borderColor: borderOverlay }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[180px] object-contain" />
            ) : (
              <span className="text-base font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* ÜDVÖZLET DOCK - JAVÍTVA */}
          <div className="mb-6 p-3 rounded-xl border" style={{ backgroundColor: cardBgColor, borderColor: borderOverlay }}>
            <span className="text-[9px] block uppercase tracking-wider font-bold opacity-60">Tenyészet</span>
            <div className="text-xs font-bold mt-0.5" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}! 👋</div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-zinc-800/10">
                {iconStyle === "minimal" && <span className="text-sm opacity-70">{item.icon}</span>}
                {iconStyle === "neon" && <span className="text-sm" style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{item.icon}</span>}
                {iconStyle === "glass-box" && (
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                    {item.icon}
                  </span>
                )}
                <span className="font-medium" style={{ color: headingColor }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 rounded-lg border text-xs transition-all" style={{ backgroundColor: cardBgColor, borderColor: borderOverlay, color: headingColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

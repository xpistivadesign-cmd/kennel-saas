import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const accentColor = branding?.accent_color || "#3b82f6";
  const bgColor = branding?.bg_color || "#09090b";
  const googleFontName = branding?.google_font_name || "Inter";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "minimal";

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

  // Automatikus szövegszín kalkuláció a főmenühöz és háttérhez
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const globalTextColor = (yiq >= 128) ? "#000000" : "#ffffff";
  const secondaryTextColor = (yiq >= 128) ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const userGreetingName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

  return (
    <div 
      className="min-h-screen flex transition-all duration-200" 
      style={{ 
        backgroundColor: bgColor, 
        color: globalTextColor,
        fontFamily: `'${googleFontName}', sans-serif`
      }}
    >
      {/* 🌐 Google Fonts dinamikus betöltése az egész szoftverben */}
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;700;900&display=swap`} />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-accent-bg { background-color: ${accentColor} !important; }
        .custom-accent-text { color: ${accentColor} !important; }
        
        /* Összes gomb és kártya igazítása a globális arculathoz */
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500 { 
          background-color: ${accentColor} !important; 
          color: ${yiq >= 128 ? '#ffffff' : '#000000'} !important;
        }

        /* Automatikus kártya háttér korrekció a főoldalakon */
        .bg-zinc-950, .bg-zinc-900 {
          background-color: ${yiq >= 128 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'} !important;
          border-color: ${yiq >= 128 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'} !important;
          color: ${globalTextColor} !important;
        }
        
        /* Szövegek színének kényszerítése */
        .text-white { color: ${globalTextColor} !important; }
        .text-zinc-400, .text-zinc-500 { color: ${secondaryTextColor} !important; }
        input, select, textarea { background-color: ${yiq >= 128 ? '#ffffff' : '#000000'} !important; color: ${globalTextColor} !important; border-color: ${yiq >= 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} !important; }
      `}} />

      <aside 
        className="w-64 shrink-0 border-r flex flex-col justify-between p-6"
        style={{ 
          backgroundColor: bgColor, 
          borderColor: yiq >= 128 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' 
        }}
      >
        <div>
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b pb-4" style={{ borderColor: yiq >= 128 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[180px] object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            ) : (
              <span className="text-base font-black flex items-center gap-1.5" style={{ color: globalTextColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          <div className="mb-6 p-3 rounded-xl border" style={{ backgroundColor: yiq >= 128 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: yiq >= 128 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
            <span className="text-[9px] block uppercase tracking-wider font-bold" style={{ color: secondaryTextColor }}>Tenyészet</span>
            <div className="text-xs font-bold mt-0.5" style={{ color: globalTextColor }}>✨ Welcome, {userGreetingName}! 👋</div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200"
                style={{ color: globalTextColor }}
              >
                {iconStyle === "minimal" && <span className="text-sm opacity-70">{item.icon}</span>}
                {iconStyle === "neon" && <span className="text-sm" style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{item.icon}</span>}
                {iconStyle === "glass-box" && (
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                    {item.icon}
                  </span>
                )}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 rounded-lg border text-xs transition-all" style={{ backgroundColor: yiq >= 128 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', borderColor: yiq >= 128 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', color: globalTextColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

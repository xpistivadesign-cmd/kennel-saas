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

  // Intelligens fényerő számítás
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  const globalTextColor = (yiq >= 128) ? "#000000" : "#ffffff";
  const secondaryTextColor = (yiq >= 128) ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
  
  // Kártyák belső színe: ha világos a háttér, picit sötétebb / ha sötét, picit világosabb áttetsző doboz
  const cardBgColor = (yiq >= 128) ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)";
  const borderOverlay = (yiq >= 128) ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";
  const inputBgColor = (yiq >= 128) ? "rgba(0,0,0,0.02)" : "rgba(0,0,0,0.4)";

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
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;500;700;900&display=swap`} />

      {/* 🛠️ RADIKÁLIS GLOBÁLIS CSS AUTOMATIZÁLÁS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. Alapvető kísérőszín osztályok */
        .custom-accent-bg { background-color: ${accentColor} !important; }
        .custom-accent-text { color: ${accentColor} !important; }
        .custom-accent-border { border-color: ${accentColor} !important; }
        
        /* 2. Gombok felülírása az összes aloldalon (mentés, hozzáadás gombok) */
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500, .bg-lime-500, 
        button:contains("+"), button:contains("MENTÉS") { 
          background-color: ${accentColor} !important; 
          color: ${yiq >= 128 ? '#ffffff' : '#000000'} !important;
          border-color: ${accentColor} !important;
        }

        /* 3. KÁRTYÁK ÉS DOBOZOK HÁTTÉR KORREKCIÓJA (Eltüntetjük a beégetett feketéket) */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800,
        div[className*="bg-zinc-950"], div[className*="bg-black"],
        .rounded-xl.border, .rounded-2xl.border {
          background-color: ${cardBgColor} !important;
          border-color: ${borderOverlay} !important;
          color: ${globalTextColor} !important;
        }
        
        /* 4. Szövegszínek kényszerítése az aloldalakon */
        h1, h2, h3, h4, .text-white { color: ${globalTextColor} !important; }
        p, .text-zinc-400, .text-zinc-500, .text-zinc-300 { color: ${secondaryTextColor} !important; }
        
        /* 5. Űrlap mezők (Inputs, Selects, Textareas) idomítása */
        input, select, textarea { 
          background-color: ${inputBgColor} !important; 
          color: ${globalTextColor} !important; 
          border-color: ${borderOverlay} !important; 
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${accentColor} !important;
        }

        /* 6. Pénzügyi grafikon belső konténerek javítása */
        div[className*="bg-zinc-900/20"] {
          background-color: rgba(0, 0, 0, 0.1) !important;
        }
      `}} />

      <aside 
        className="w-64 shrink-0 border-r flex flex-col justify-between p-6"
        style={{ 
          backgroundColor: bgColor, 
          borderColor: borderOverlay 
        }}
      >
        <div>
          {/* LOGÓ */}
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b pb-4" style={{ borderColor: borderOverlay }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[180px] object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            ) : (
              <span className="text-base font-black flex items-center gap-1.5" style={{ color: globalTextColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* ÜDVÖZLET */}
          <div className="mb-6 p-3 rounded-xl border" style={{ backgroundColor: cardBgColor, borderColor: borderOverlay }}>
            <span className="text-[9px] block uppercase tracking-wider font-bold" style={{ color: secondaryTextColor }}>Tenyészet</span>
            <div className="text-xs font-bold mt-0.5" style={{ color: globalTextColor }}>✨ Welcome, {userGreetingName}! 👋</div>
          </div>

          {/* NAVIGÁCIÓ */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 hover:bg-zinc-800/10"
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
          <button type="submit" className="w-full px-3 py-2 rounded-lg border text-xs transition-all" style={{ backgroundColor: cardBgColor, borderColor: borderOverlay, color: globalTextColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

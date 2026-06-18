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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Lekérjük a kibővített arculati beállításokat
  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const accentColor = branding?.accent_color || "#3b82f6";
  const bgStyle = branding?.bg_style || "zinc";
  const fontFamily = branding?.font_family || "sans";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "minimal";

  // Szuper, egyedi ikonok társítása a prémium kinézethez
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

  let bgMainClass = "bg-zinc-950";
  let bgAsideClass = "bg-zinc-950 border-zinc-800";
  if (bgStyle === "pitch-black") {
    bgMainClass = "bg-black";
    bgAsideClass = "bg-black border-zinc-900";
  } else if (bgStyle === "slate") {
    bgMainClass = "bg-slate-950";
    bgAsideClass = "bg-slate-950 border-slate-900";
  }

  let fontClass = "font-sans";
  if (fontFamily === "mono") fontClass = "font-mono";
  if (fontFamily === "serif") fontClass = "font-serif";

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // Megpróbáljuk szépen kiszedni a felhasználó keresztnevét vagy email címét a köszöntéshez
  const userGreetingName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className={`min-h-screen flex ${bgMainClass} text-white ${fontClass}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-accent-bg { background-color: ${accentColor} !important; }
        .custom-accent-text { color: ${accentColor} !important; }
        
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500 { 
          background-color: ${accentColor} !important; 
          color: black !important;
        }
      `}} />

      <aside className={`w-64 shrink-0 border-r flex flex-col justify-between p-6 ${bgAsideClass}`}>
        <div>
          {/* LOGÓ SZEKCIÓ */}
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b border-zinc-900 pb-4">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Kennel Logo" 
                className="h-8 max-w-[180px] object-contain"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <span className="text-base font-black text-white flex items-center gap-1.5">
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* DYNAMIC WELCOME BANNER A MENÜ ALATT */}
          <div className="mb-6 p-3 bg-zinc-900/30 rounded-xl border border-zinc-900/50">
            <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-bold">Bejelentkezve</span>
            <div className="text-xs font-bold text-zinc-200 mt-0.5">✨ Welcome back, {userGreetingName}!</div>
          </div>

          {/* MENÜPONTOK IKON STÍLUSOKKAL */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-zinc-400 hover:bg-zinc-900/50 hover:text-white transition-all duration-200"
              >
                {/* MINIMAL fehér/szürke ikon stílus */}
                {iconStyle === "minimal" && (
                  <span className="text-sm grayscale opacity-70 group-hover:grayscale-0">{item.icon}</span>
                )}
                
                {/* NEON izzó ikon stílus */}
                {iconStyle === "neon" && (
                  <span className="text-sm" style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{item.icon}</span>
                )}
                
                {/* GLASS-BOX színes prémium dobozos ikon stílus */}
                {iconStyle === "glass-box" && (
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs transition-colors" style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                    {item.icon}
                  </span>
                )}

                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition">
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className={`flex-1 min-w-0 p-8 ${bgMainClass}`}>{children}</main>
    </div>
  );
}

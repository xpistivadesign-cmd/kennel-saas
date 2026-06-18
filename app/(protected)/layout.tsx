import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// FIX ALAPÉRTELMEZETT DÁTUM (Ha minden kötél szakad, ez lesz a dizájn)
const DEFAULT_THEME = {
  bg: "#1a0b2e", // Mély sötétlila (Nem fekete!)
  accent: "#eab308", // Arany/Sárga
  heading: "#ffffff",
  body: "#d8b4fe"
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // BIZTONSÁGOS LEKÉRDEZÉS (Nem használunk .single()-t, mert az crashelhet)
  const { data: brandingData } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id);

  const branding = brandingData?.[0] || null;

  // SZÍNEK KIVÁLASZTÁSA (Ha nincs mentve semmi, a DEFAULT_THEME-et használjuk)
  const bgColor = branding?.bg_color && branding.bg_color !== "#000000" ? branding.bg_color : DEFAULT_THEME.bg;
  const accentColor = branding?.accent_color && branding.accent_color !== "#000000" ? branding.accent_color : DEFAULT_THEME.accent;
  const headingColor = branding?.text_heading_color || DEFAULT_THEME.heading;
  const bodyColor = branding?.text_body_color || DEFAULT_THEME.body;
  
  const kennelName = branding?.kennel_name || "Kennel OS";
  const logoUrl = branding?.logo_url || null;
  const iconStyle = branding?.icon_style || "glass-box";

  // ÜDVÖZLÉS FIXÁLÁSA
  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

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
    <div className="min-h-screen flex transition-all duration-300" style={{ backgroundColor: bgColor, color: bodyColor }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;900&display=swap" />

      {/* 🛠️ ULTRA-AGRESSZÍV CSS INJEKCIÓ - MINDENT FELÜLÍRUNK */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, html { background-color: ${bgColor} !important; font-family: 'Poppins', sans-serif !important; }
        
        /* Címek és Szövegek */
        h1, h2, h3, h4, .text-white, strong, b, th { color: ${headingColor} !important; }
        p, span, td, label, li, .text-zinc-400, .text-zinc-300 { color: ${bodyColor} !important; }

        /* Gombok kényszerítése */
        button[type="submit"], .bg-emerald-500, .bg-blue-500, .bg-blue-600, .bg-zinc-100, 
        button.bg-black.text-white, .bg-indigo-600 {
          background-color: ${accentColor} !important;
          color: #000000 !important;
          border: none !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          box-shadow: 0 4px 20px ${accentColor}66 !important;
        }

        /* 🔮 VALÓDI ÜVEGHATÁSÚ LÜKTETŐ KÁRTYÁK */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .bg-zinc-800\\/50, .rounded-xl.border, .border-zinc-800 {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
          color: ${bodyColor} !important;
        }

        /* Hover effekt */
        .bg-zinc-900:hover, .rounded-xl.border:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
          transform: translateY(-5px);
          border-color: ${accentColor}88 !important;
        }

        /* Inputok */
        input, select, textarea {
          background-color: rgba(0, 0, 0, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }
      `}} />

      <aside className="w-64 shrink-0 border-r flex flex-col justify-between p-6" style={{ backgroundColor: "rgba(0,0,0,0.2)", borderColor: "rgba(255,255,255,0.1)" }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b border-white/10 pb-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 max-w-[180px] object-contain" />
            ) : (
              <span className="text-xl font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* ÜDVÖZLŐ KÁRTYA */}
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] uppercase font-bold opacity-50 block">Bejelentkezve</span>
            <div className="text-sm font-black mt-1" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}!</div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/10">
                {iconStyle === "glass-box" ? (
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">{item.icon}</span>
                ) : (
                  <span>{item.icon}</span>
                )}
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-red-500/20 transition-all">
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

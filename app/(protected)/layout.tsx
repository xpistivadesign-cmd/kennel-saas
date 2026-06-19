import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildThemeTokens } from "@/lib/theme/tokens";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: branding } = await supabase.from("branding_settings").select("*").eq("user_id", user.id).maybeSingle();
  const theme = buildThemeTokens(branding);
  
  const kennelName = branding?.kennel_name || "Saját Kennel";
  const logoUrl = branding?.logo_url || null;

  const navItems = [
    { href: "/dashboard", label: "📊 Dashboard" },
    { href: "/dogs", label: "🐕 Kutyák" },
    { href: "/heats", label: "🩸 Tüzelések" },
    { href: "/litters", label: "🐾 Almok" },
    { href: "/shows", label: "🏆 Shows" },
    { href: "/buyers", label: "👥 Buyers & Waitlist" },
    { href: "/finance", label: "💰 Finance" },
    { href: "/settings/branding", label: "🎨 Branding & Stílus" },
  ];

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.bg, color: theme.textBody, fontFamily: theme.font }}>
      {/* Mind a 10 prémium Google font család importálása */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@400;600;900&family=Manrope:wght@400;600;800&family=Montserrat:wght@400;600;900&family=Oswald:wght@400;600&family=Outfit:wght@400;600;800&family=Playfair+Display:wght@400;700;900&family=Poppins:wght@400;600;900&family=Roboto:wght@400;700&family=Ubuntu:wght@400;700&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${theme.primary};
          --accent: ${theme.accent};
          --bg: ${theme.bg};
          --surface: ${theme.surface};
          --text-heading: ${theme.textHeading};
          --text-body: ${theme.textBody};
          --radius: ${theme.radius};
          --transition: ${theme.transition};
          --border: ${theme.border};
        }

        html, body, .app-shell {
          background-color: var(--bg) !important;
          color: var(--text-body) !important;
          font-family: ${theme.font} !important;
          transition: background var(--transition), color var(--transition);
        }

        main, [className*="bg-zinc-950"], [className*="bg-black"], [className*="bg-slate-950"] {
          background-color: var(--bg) !important;
        }

        .card, div[className*="bg-zinc-900"], div[className*="bg-zinc-800"], section[className*="bg-zinc-"], div[className*="rounded-xl"] {
          background: ${theme.style === "glass" ? `rgba(255, 255, 255, 0.03)` : "var(--surface)"} !important;
          backdrop-filter: ${theme.glass} !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: ${theme.shadow} !important;
          ${theme.style === "neon" ? `box-shadow: ${theme.glow} !important;` : ""}
        }

        .dashboard-grid > div:nth-child(1) { background: ${theme.card1} !important; }
        .dashboard-grid > div:nth-child(2) { background: ${theme.card2} !important; }
        .dashboard-grid > div:nth-child(3) { background: ${theme.card3} !important; }

        /* 🚨 BETŰSZÍN KÉNYSZERÍTÉS: Itt fehérednek ki a láthatatlan szövegek a kutyáknál és a dashboardon */
        h1, h2, h3, h4, th, .text-white, strong, [className*="text-zinc-100"], [className*="text-zinc-200"], div[className*="font-bold"] { 
          color: var(--text-heading) !important; 
        }
        p, span, label, td, option, li, [className*="text-zinc-400"], [className*="text-zinc-300"], [className*="text-gray-"] { 
          color: var(--text-body) !important;
        }

        button, button[type="submit"], .bg-emerald-500, .bg-purple-600, .bg-amber-500, button[className*="bg-"] {
          background: var(--accent) !important;
          color: #000000 !important;
          border-radius: var(--radius) !important;
          font-weight: 900 !important;
          border: none !important;
        }

        input, textarea, select {
          background: rgba(255,255,255,0.04) !important;
          color: var(--text-heading) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
        }

        .sidebar { width: 270px; background: ${theme.sidebar}; border-right: 1px solid var(--border); backdrop-filter: blur(20px); padding: 30px; }
        .sidebar-link { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: var(--radius); color: var(--text-heading); text-decoration: none; font-weight: 600; }
        .sidebar-link:hover { background: rgba(255,255,255,0.04); }
        .main { flex: 1; padding: 36px; min-width: 0; }
      `}} />

      <aside className="sidebar">
        <div className="mb-10 font-black text-2xl tracking-tight" style={{ color: "var(--text-heading)" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain" /> : `⚡ ${kennelName}`}
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="sidebar-link">{item.label}</Link>
          ))}
        </nav>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}

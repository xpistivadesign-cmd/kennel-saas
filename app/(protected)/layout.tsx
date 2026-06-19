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

  // Hiánytalan, fix menürendszer
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
    <div className="app-shell">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&family=Poppins:wght@400;600;900&family=Cinzel:wght@400;700;900&family=Montserrat:wght@400;600;900&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${theme.primary};
          --accent: ${theme.accent};
          --bg: ${theme.bg};
          --surface: ${theme.surface};
          --text: ${theme.text};
          --radius: ${theme.radius};
          --transition: ${theme.transition};
          --font-family: ${theme.font};
        }

        html, body, .app-shell, main {
          background: var(--bg) !important;
          color: var(--text) !important;
          font-family: var(--font-family) !important;
          transition: background var(--transition), color var(--transition);
          margin: 0;
          box-sizing: border-box;
        }

        * { box-sizing: border-box; }
        .app-shell { display: flex; min-height: 100vh; }

        /* Központi kártya architektúra (Glassmorphism & Neon támogatással) */
        .card, div[className*="rounded-xl"], div[className*="rounded-2xl"], section[className*="bg-zinc-"] {
          background: ${theme.style === "glass" ? `rgba(255,255,255,0.03)` : "var(--surface)"} !important;
          backdrop-filter: ${theme.glass} !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: ${theme.shadow} !important;
          border: 1px solid ${theme.text}15 !important;
          ${theme.style === "neon" ? `box-shadow: ${theme.glow} !important;` : ""}
        }

        /* Dashboard grid: 3 teljesen különböző Violet / Lime gradiens árnyalat */
        .dashboard-grid div:nth-child(1), .dashboard-grid div[className*="rounded-"]:nth-child(1) { background: ${theme.card1} !important; }
        .dashboard-grid div:nth-child(2), .dashboard-grid div[className*="rounded-"]:nth-child(2) { background: ${theme.card2} !important; }
        .dashboard-grid div:nth-child(3), .dashboard-grid div[className*="rounded-"]:nth-child(3) { background: ${theme.card3} !important; }

        /* Globális akciógombok igazítása az Accent (Lime) színre */
        button, button[type="submit"], .bg-emerald-500, .bg-purple-600, .bg-amber-500, button[className*="bg-"] {
          background: var(--accent) !important;
          color: #000000 !important;
          border-radius: var(--radius) !important;
          font-weight: 900 !important;
          border: none !important;
          box-shadow: 0 4px 15px ${theme.accent}30 !important;
          cursor: pointer;
        }

        /* Beviteli mezők intelligens színkezelése, hogy minden módban tökéletesen olvasható legyen */
        input, textarea, select {
          background: ${theme.text}08 !important;
          color: var(--text) !important;
          border: 1px solid ${theme.text}20 !important;
          border-radius: var(--radius) !important;
          padding: 14px !important;
        }

        .sidebar {
          width: 270px;
          background: ${theme.sidebar};
          border-right: 1px solid ${theme.text}10;
          backdrop-filter: blur(20px);
          padding: 30px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: var(--radius);
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          transition: all var(--transition);
        }
        .sidebar-link:hover { background: ${theme.text}05; transform: translateX(3px); }

        .main { flex: 1; padding: 36px; }
        h1, h2, h3, .text-white { color: var(--text) !important; }
      `}} />

      <aside className="sidebar">
        <div className="mb-10 font-black text-2xl tracking-tight" style={{ color: "var(--text)" }}>
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

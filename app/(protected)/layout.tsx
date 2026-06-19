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
    <div className="app-shell">
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
          --border: ${theme.border};
        }

        /* 🚨 RADIKÁLIS TAILWIND UTILITY MAPPING: Minden aloldal kényszerítése */
        html, body, .app-shell, main, 
        .bg-black, .bg-zinc-950, [className*="bg-slate-950"] {
          background-color: var(--bg) !important;
          color: var(--text) !important;
          font-family: var(--font-family) !important;
          transition: background var(--transition), color var(--transition);
        }

        /* Minden Tailwind alapú kártya, szekció és konténer átkötése a központi felületre */
        .card, 
        div[className*="bg-zinc-900"], 
        div[className*="bg-zinc-800"], 
        section[className*="bg-zinc-"], 
        div[className*="rounded-xl"] {
          background: ${theme.style === "glass" ? `rgba(255, 255, 255, 0.03)` : "var(--surface)"} !important;
          backdrop-filter: ${theme.glass} !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: ${theme.shadow} !important;
          ${theme.style === "neon" ? `box-shadow: ${theme.glow} !important;` : ""}
        }

        /* 📊 Dashboard Grid kártyák: 3 teljesen különálló, elegáns Violet/Lime gradiens árnyalat */
        .dashboard-grid > div:nth-child(1), .dashboard-grid > a:nth-child(1) { background: ${theme.card1} !important; }
        .dashboard-grid > div:nth-child(2), .dashboard-grid > a:nth-child(2) { background: ${theme.card2} !important; }
        .dashboard-grid > div:nth-child(3), .dashboard-grid > a:nth-child(3) { background: ${theme.card3} !important; }

        /* Szövegszínek kényszerítése a meglévő Tailwind text osztályokon */
        h1, h2, h3, h4, th, .text-white, [className*="text-zinc-100"], [className*="text-zinc-200"] { 
          color: var(--text) !important; 
        }
        p, span, label, td, option, [className*="text-zinc-400"], [className*="text-zinc-300"], [className*="text-gray-400"] { 
          color: var(--text) !important; 
          opacity: 0.9 !important;
        }

        /* Gombok kényszerítése az Accent (Lime) színre */
        button, button[type="submit"], .bg-emerald-500, .bg-purple-600, .bg-amber-500, button[className*="bg-"] {
          background: var(--accent) !important;
          color: #000000 !important;
          border-radius: var(--radius) !important;
          font-weight: 900 !important;
          border: none !important;
          box-shadow: 0 4px 15px ${theme.accent}30 !important;
        }

        /* Inputok és select panelek idomítása, hogy látható és olvasható legyen a szöveg */
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
          border-right: 1px solid var(--border);
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

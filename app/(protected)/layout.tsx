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

  const mainNav = [
    { href: "/dashboard", label: "📊 Dashboard" },
    { href: "/dogs", label: "🐕 Kutyák" },
    { href: "/heats", label: "🩸 Tüzelések" },
    { href: "/litters", label: "🐾 Almok" },
    { href: "/shows", label: "🏆 Shows" },
    { href: "/buyers", label: "👥 Buyers & Waitlist" },
    { href: "/finance", label: "💰 Finance" },
  ];

  const settingsNav = [
    { href: "/settings/profile", label: "🏢 Kennel Profile" },
    { href: "/settings/branding", label: "🎨 Appearance" },
    { href: "/settings/dashboard", label: "📊 Dashboard Layout" },
    { href: "/settings/dogs", label: "🐕 Dogs Settings" },
    { href: "/settings/notifications", label: "🔔 Notifications" },
    { href: "/settings/localization", label: "🌍 Localization" },
    { href: "/settings/security", label: "🔐 Security" },
    { href: "/settings/labs", label: "🧪 Labs" },
  ];

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.bg, color: theme.text }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;900&family=Poppins:wght@300;400;600;900&family=Manrope:wght@300;400;600;800&family=Sora:wght@300;400;600;800&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${theme.primary};
          --accent: ${theme.accent};
          --bg: ${theme.bg};
          --surface: ${theme.surface};
          --text: ${theme.text};
          --border: ${theme.border};
          --radius: ${theme.radius};
          --transition: ${theme.transition};
          --sidebar-width: ${theme.sidebarWidth};
          --font-scale: ${theme.fontScale};
        }

        html, body, .app-shell {
          background-color: var(--bg) !important;
          color: var(--text) !important;
          font-family: ${theme.font} !important;
          font-size: calc(14px * var(--font-scale)) !important;
          letter-spacing: ${theme.letterSpacing};
          font-weight: ${theme.fontWeight};
        }

        /* 💎 KÁRTYA STÍLUS ÉS GRADIENT ENGINE */
        .card, div[className*="bg-zinc-900"], section[className*="bg-zinc-"], div[className*="rounded-xl"] {
          background: ${theme.glassEnabled ? `rgba(255,255,255,calc(${theme.glassOpacity} / 100))` : "var(--surface)"} !important;
          backdrop-filter: ${theme.glassEnabled ? `blur(${theme.glassBlur}px)` : "none"} !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          box-shadow: ${theme.glassEnabled ? `0 8px 32px rgba(0,0,0,calc(${theme.glassShadow} / 100))` : "none"} !important;
          transition: all var(--transition);
        }

        .card:hover {
          transform: translateY(-${theme.hoverLift});
        }

        /* 📊 DASHBOARD SPECIFIKUS KÁRTYA ÁRNYALATOK */
        .dashboard-grid > div:nth-child(1), .dashboard-grid > a:nth-child(1) { background: ${theme.card1} !important; }
        .dashboard-grid > div:nth-child(2), .dashboard-grid > a:nth-child(2) { background: ${theme.card2} !important; }
        .dashboard-grid > div:nth-child(3), .dashboard-grid > a:nth-child(3) { background: ${theme.card3} !important; }
        .dashboard-grid > div:nth-child(4), .dashboard-grid > a:nth-child(4) { background: ${theme.card4} !important; }

        /* BUTTON ARCHITECTURE */
        button, button[type="submit"], .bg-primary-btn {
          background: ${theme.buttonStyle === "gradient" ? `linear-gradient(135deg, var(--primary), var(--accent))` : "var(--accent)"} !important;
          color: #000000 !important;
          border-radius: ${theme.buttonRadius} !important;
          font-weight: 800 !important;
          border: ${theme.buttonStyle === "outline" ? "2px solid var(--primary)" : "none"} !important;
          box-shadow: 0 4px 15px rgba(0,0,0,calc(${theme.buttonGlow} / 100)) !important;
        }

        .sidebar {
          width: var(--sidebar-width);
          background: ${theme.sidebarBg};
          border-right: 1px solid var(--border);
          backdrop-filter: blur(20px);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-between: space-between;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius);
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9em;
        }
        .sidebar-link:hover { background: ${theme.sidebarHover}; }
        .sidebar-link.active { background: ${theme.sidebarActive} !important; color: #000000 !important; }

        .main-content { flex: 1; padding: 40px; min-width: 0; overflow-y: auto; }

        /* Felhasználói egyedi CSS injekció lefutása */
        ${theme.customCss}
      `}} />

      <aside className="sidebar">
        <div className="space-y-6">
          <div className="font-black text-xl px-2">⚡ {branding?.kennel_name || "Kennel OS"}</div>
          
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">{item.label}</Link>
            ))}
          </nav>

          <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-[10px] uppercase font-bold opacity-40 block px-4 mb-2">⚙️ Settings Matrix</span>
            <nav className="space-y-1">
              {settingsNav.map((item) => (
                <Link key={item.href} href={item.href} className="sidebar-link">{item.label}</Link>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

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

  // 📊 1. FŐ OPERATÍV NAVIGÁCIÓ (Ami most hiányzott!)
  const mainNav = [
    { href: "/dashboard", label: "📊 Dashboard" },
    { href: "/dogs", label: "🐕 Kutyák" },
    { href: "/heats", label: "🩸 Tüzelések" },
    { href: "/litters", label: "🐾 Almok" },
    { href: "/shows", label: "🏆 Shows" },
    { href: "/buyers", label: "👥 Buyers & Waitlist" },
    { href: "/finance", label: "💰 Finance" },
  ];

  // ⚙️ 2. RÉSZLETES BEÁLLÍTÁSOK NAVIGÁCIÓ
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

  // Háttérmintázatok CSS generátora
  let patternCss = "";
  if (theme.bgPattern === "dots") {
    patternCss = `background-image: radial-gradient(var(--border) 1px, transparent 1px); background-size: 20px 20px;`;
  } else if (theme.bgPattern === "grid") {
    patternCss = `background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 20px 20px;`;
  } else if (theme.bgPattern === "noise") {
    patternCss = `background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");`;
  }

  return (
    <div className="app-shell" style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;900&family=Manrope:wght@300;400;600;800&family=Sora:wght@300;400;600;800&family=Poppins:wght@300;400;600;900&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Space+Grotesk:wght@300;400;600;700&display=swap" />

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
        }

        html, body, .app-shell {
          background-color: var(--bg) !important;
          ${theme.bgGradientEnabled ? `background-image: linear-gradient(${theme.bgGradientAngle}deg, ${theme.bgGradientFrom}, ${theme.bgGradientTo}) !important;` : ""}
          color: var(--text) !important;
          font-size: calc(14px * ${theme.fontScale}) !important;
          font-weight: ${theme.fontWeight};
          letter-spacing: ${theme.letterSpacing};
        }

        main { position: relative; }
        main::before {
          content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
          ${patternCss}
        }

        .card, div[className*="bg-zinc-900"], section[className*="bg-zinc-"], div[className*="rounded-xl"] {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          position: relative; z-index: 1;
        }

        .widget-dogs-card { background: ${theme.widgetDogsBg} !important; }
        .widget-litters-card { background: ${theme.widgetLittersBg} !important; }
        .widget-heats-card { background: ${theme.widgetHeatsBg} !important; }
        .widget-finance-card { background: ${theme.widgetFinanceBg} !important; }

        h1, h2, h3, .text-white, div[className*="font-black"] {
          color: ${theme.headingColor} !important;
          text-transform: ${theme.headingUppercase} !important;
        }
        p, label, span:not([className*="bg-"]) {
          color: ${theme.subHeadingColor} !important;
        }

        button, button[type="submit"], .bg-primary-btn {
          background: ${theme.btnPrimaryBg} !important;
          color: ${theme.btnPrimaryText} !important;
          border-radius: ${theme.btnRadius} !important;
          font-weight: 900 !important;
          border: none !important;
          transition: transform 0.2s ease;
        }
        button:hover { transform: scale(1.02); }

        input, textarea, select {
          background: ${theme.inputBg} !important;
          border: 1px solid ${theme.inputBorder} !important;
          color: ${theme.text} !important;
          border-radius: ${theme.btnRadius} !important;
        }

        .sidebar {
          width: var(--sidebar-width);
          background: ${theme.sidebarBg};
          border-right: 1px solid var(--border);
          padding: 24px;
          display: flex; flex-direction: column; gap: 24px;
        }
        .sidebar-link {
          display: flex; items-center; gap: 10px; padding: 10px 14px;
          border-radius: var(--radius); color: ${theme.sidebarTextColor}; text-decoration: none; font-weight: 600;
        }
        .sidebar-link:hover { background: rgba(255,255,255,0.03); }
        
        .main-shell { flex: 1; padding: 40px; overflow-y: auto; position: relative; }

        ${theme.customCss}
      `}} />

      <aside className="sidebar">
        {/* LOGÓ VAGY KENNEL NÉV */}
        <div className="font-black text-xl tracking-tight px-3" style={{ color: "var(--text)" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 object-contain" /> : `⚡ ${kennelName}`}
        </div>
        
        {/* 📊 SZEKCIÓ 1: FŐ FUNKCIÓK */}
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black opacity-30 block px-3 mb-2">🐾 Management</span>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">{item.label}</Link>
            ))}
          </nav>
        </div>
        
        {/* ⚙️ SZEKCIÓ 2: CONFIGURATION MATRIX */}
        <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-[9px] uppercase font-black opacity-30 block px-3 mb-2">⚙️ System Matrix</span>
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">{item.label}</Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="main-shell">{children}</main>
    </div>
  );
}

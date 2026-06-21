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
  
  const kennelName = branding?.kennel_name || "My Kennel";
  const logoUrl = branding?.logo_url || null;

  // 📊 ENGLISH SIDEBAR NAVIGATION MATRIX
  const mainNav = [
    { 
      href: "/dashboard", 
      label: "Dashboard",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    },
    { 
      href: "/dogs", 
      label: "Dogs",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26a4 4 0 0 1 3 3.74c0 .5-.15.99-.42 1.41A4 4 0 0 1 18 14c0 1.5-1 2.5-2.5 2.5h-7C7 16.5 6 15.5 6 14a4 4 0 0 1 1.42-3.59c-.27-.42-.42-.91-.42-1.41a4 4 0 0 1 3-3.74c.65-.17 1.33-.26 2-.26Z"/><circle cx="6" cy="4" r="1"/><circle cx="10" cy="2" r="1"/><circle cx="14" cy="2" r="1"/><circle cx="18" cy="4" r="1"/></svg>
    },
    { 
      href: "/veterinary", 
      label: "Veterinary & Health",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    },
    { 
      href: "/heats", 
      label: "Heats",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> 
    },
    { 
      href: "/litters", 
      label: "Litters",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2h4v2h-4zM9 7h6l1 3v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10z"/><path d="M10 11h4v4h-4z"/></svg>
    },
    { 
      href: "/shows", 
      label: "Shows",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
    },
    { 
      href: "/buyers", 
      label: "Buyers & Waitlist",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
    { 
      href: "/finance", 
      label: "Finance",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    },
  ];

  const settingsNav = [
    { href: "/settings/profile", label: "Kennel Profile", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { href: "/settings/branding", label: "Appearance", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> },
    { href: "/settings/dashboard", label: "Dashboard Layout", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg> },
    { href: "/settings/dogs", label: "Dogs Settings", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { href: "/settings/notifications", label: "Notifications", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { href: "/settings/localization", label: "Localization", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
    { href: "/settings/security", label: "Security", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { href: "/settings/labs", label: "Labs", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v4a2 2 0 0 1-.58 1.41l-4.83 4.83A2 2 0 0 0 4 13.66V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.34a2 2 0 0 0-.59-1.42l-4.83-4.83A2 2 0 0 1 14 6V2z"/></svg> },
  ];

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
          display: flex; align-items: center; gap: 12px; padding: 10px 14px;
          border-radius: var(--radius); color: ${theme.sidebarTextColor}; text-decoration: none; font-weight: 600;
          transition: all var(--transition);
        }
        .sidebar-link:hover { 
          background: rgba(255,255,255,0.03); 
          color: var(--primary);
        }
        .sidebar-link svg {
          opacity: 0.6;
          transition: transform 0.2s ease;
        }
        .sidebar-link:hover svg {
          opacity: 1;
          transform: scale(1.05);
        }
        
        .main-shell { flex: 1; padding: 40px; overflow-y: auto; position: relative; }

        ${theme.customCss}
      `}} />

      <aside className="sidebar">
        <div className="font-black text-xl tracking-tight px-3 flex items-center gap-2" style={{ color: "var(--text)" }}>
          {logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 object-contain" /> : `⚡ ${kennelName}`}
        </div>
        
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black opacity-30 block px-3 mb-2">🐾 Management</span>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">
                <span className="flex-shrink-0" style={{ color: "var(--primary)" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="text-[9px] uppercase font-black opacity-30 block px-3 mb-2">⚙️ System Matrix</span>
          <nav className="space-y-1">
            {settingsNav.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">
                <span className="flex-shrink-0" style={{ color: "var(--accent)" }}>{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="main-shell">{children}</main>
    </div>
  );
}

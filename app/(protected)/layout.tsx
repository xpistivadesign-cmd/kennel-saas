import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Hivatalos Téma Token-Mátrix a kért struktúra alapján
const THEMES = {
  midnight: { primary: "#7D39EB", accent: "#C6FF33", bg: "#000000", surface: "#090A0F", text: "#FFFFFF" },
  aurora:   { primary: "#0EA5E9", accent: "#2DD4BF", bg: "#030712", surface: "#0B1329", text: "#FFFFFF" },
  emerald:  { primary: "#10B981", accent: "#34D399", bg: "#022C22", surface: "#064E3B", text: "#FFFFFF" },
  royal:    { primary: "#D4AF37", accent: "#F3E5AB", bg: "#0B0C10", surface: "#1F2833", text: "#FFFFFF" }
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const b = brandingData?.[0] || null;

  // Választók alapértelmezései
  const mode = b?.theme_mode || "dark"; // dark, light, system
  const currentTheme = b?.preset_palette || "midnight"; // midnight, aurora, emerald, royal, custom
  const style = b?.ui_style || "neon"; // flat, glass, neon
  const radius = b?.ui_radius || "medium"; // sharp, medium, soft
  const animation = b?.ui_animation || "normal"; // minimal, normal, dynamic
  const density = b?.ui_density || "balanced"; // compact, balanced, luxury

  // Token alapértékek kiszámítása
  let t = THEMES[currentTheme as keyof typeof THEMES] || THEMES.midnight;
  
  let baseBg = t.bg;
  let basePrimary = t.primary;
  let baseAccent = t.accent;
  let baseSurface = t.surface;
  let baseText = t.text;

  // Mode felülbírálás (Light mode logika)
  if (mode === "light") {
    baseBg = "#FFFFFF";
    baseSurface = "#F9FAFB";
    baseText = "#111827";
  } else if (currentTheme === "custom") {
    baseBg = b?.bg_color || "#000000";
    basePrimary = b?.primary_color || "#7D39EB";
    baseAccent = b?.accent_color || "#C6FF33";
    baseSurface = b?.card_color || "#090A0F";
    baseText = mode === "light" ? "#111827" : "#FFFFFF";
  }

  // Stílusjegyek (Radius, Glass, Animations tiszta leképezése)
  const radiusValue = radius === "sharp" ? "0px" : radius === "soft" ? "24px" : "12px";
  const animValue = animation === "minimal" ? "0s" : animation === "dynamic" ? "0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "0.2s ease";
  const mainPadding = density === "compact" ? "1.5rem" : density === "luxury" ? "3.5rem" : "2.5rem";

  const kennelName = b?.kennel_name || "Saját Kennel";
  const logoUrl = b?.logo_url || null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dogs", label: "Kutyák", icon: "🐕" },
    { href: "/heats", label: "Tüzelések", icon: "🩸" },
    { href: "/litters", label: "Almok", icon: "🐾" },
    { href: "/settings/branding", label: "Branding & Stílus", icon: "🎨" }
  ];

  return (
    <div className="min-h-screen flex app-container" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {/* ⚡ A TISZTA ÉS EGYSÉGES TOKENSZABÁLYZAT INJEKCIÓJA */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary: ${basePrimary};
          --accent: ${baseAccent};
          --bg: ${baseBg};
          --surface: ${baseSurface};
          --text: ${baseText};
          --border: ${baseText}15;
          --radius: ${radiusValue};
          --transition: ${animValue};

          /* Dinamikus, egymástól eltérő kártya-árnyalatok violet és lime alapon a Dashboardhoz */
          --surface-1: ${basePrimary}10;
          --surface-2: ${baseAccent}0c;
          --surface-3: ${basePrimary}08;
        }

        /* Token alapú globális kényszerítés */
        body, html, main, .app-container { 
          background-color: var(--bg) !important; 
          font-family: 'Inter', sans-serif;
          transition: background var(--transition), color var(--transition);
        }
        
        main { padding: ${mainPadding} !important; }

        /* Tiszta kártya és sidebar token leképezés, semmi hardcoded szín */
        .custom-card, div[className*="rounded-xl"], .bg-zinc-900, .bg-zinc-950 {
          background-color: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius) !important;
          color: var(--text) !important;
          ${style === "glass" ? `backdrop-filter: blur(12px) !important; background-color: \${baseText}05 !important;` : ""}
          ${style === "neon" ? `box-shadow: 0 0 15px \${basePrimary}08 !important;` : ""}
        }

        /* Akciógombok tokenizálása */
        button[type="submit"], .bg-primary-btn, .bg-emerald-500, .bg-purple-600 {
          background-color: var(--accent) !important;
          color: #000000 !important;
          border-radius: var(--radius) !important;
          font-weight: 900 !important;
          border: none !important;
          transition: transform var(--transition);
          ${style === "neon" ? `box-shadow: 0 0 12px \${baseAccent}40 !important;` : ""}
        }
        button:hover { transform: translateY(-1px); }

        /* Szövegek tokenizálása */
        h1, h2, h3, .text-white { color: var(--text) !important; }
        p, span, label, td { color: var(--text) !important; opacity: 0.85; }
      `}} />

      {/* SIDEBAR TOKENEKET HASZNÁLVA */}
      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ borderColor: "var(--border)", backgroundColor: "rgba(0,0,0,0.05)" }}>
        <div>
          <div className="mb-8 border-b pb-4" style={{ borderColor: "var(--border)" }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain" />
            ) : (
              <span className="text-lg font-black tracking-tight" style={{ color: "var(--text)" }}>
                <span style={{ color: "var(--primary)" }}>⚡</span> {kennelName}
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-white/5" style={{ color: "var(--text)" }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--primary)" }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}

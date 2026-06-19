import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const b = brandingData?.[0] || null;

  // Alapértelmezett értékek (Midnight Neon - Dark Mode az alapértelmezett)
  const themeMode = b?.theme_mode || "dark"; // dark, light, vagy custom
  
  let bg = "#000000";
  let primary = "#7D39EB"; // Violet
  let accent = "#C6FF33";  // Lime
  let card = "rgba(125, 57, 235, 0.06)";
  let success = "#10B981";
  let warning = "#F59E0B";
  let danger = "#EF4444";
  let radius = "12px";
  let shadow = "0 4px 20px rgba(0,0,0,0.5)";
  let glass = "0px";

  // Kapcsolók
  const isGradient = b?.feat_gradient === true;
  const isGlass = b?.feat_glass === true;
  const isNeon = b?.feat_neon !== false; // Neon alapból legyen igaz a hangulathoz
  const isCompact = b?.feat_compact === true;
  const isHighContrast = b?.feat_contrast === true;

  if (themeMode === "light") {
    bg = "#FFFFFF";
    primary = "#7D39EB";
    accent = "#C6FF33";
    card = "rgba(125, 57, 235, 0.04)";
    shadow = "0 4px 20px rgba(0,0,0,0.05)";
  } else if (themeMode === "custom") {
    bg = b?.bg_color || "#000000";
    primary = b?.primary_color || "#7D39EB";
    accent = b?.accent_color || "#C6FF33";
    card = b?.card_color || "rgba(255,255,255,0.05)";
    success = b?.success_color || "#10B981";
    warning = b?.warning_color || "#F59E0B";
    danger = b?.danger_color || "#EF4444";
    radius = `${b?.ui_radius || 12}px`;
    shadow = b?.ui_shadow || "0 4px 20px rgba(0,0,0,0.5)";
    glass = `${b?.ui_glass_intensity || 0}px`;
  }

  const textHeading = themeMode === "light" ? "#111827" : "#FFFFFF";
  const textBody = themeMode === "light" ? "#4B5563" : "#9CA3AF";

  const kennelName = b?.kennel_name || "Kennel OS";
  const logoUrl = b?.logo_url || null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: bg, color: textBody }}>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: ${bg};
          --primary: ${primary};
          --accent: ${accent};
          --card: ${card};
          --success: ${success};
          --warning: ${warning};
          --danger: ${danger};
          --radius: ${radius};
          --text-heading: ${textHeading};
          --text-body: ${textBody};
        }

        body, html, main, .min-h-screen { background-color: var(--bg) !important; }
        
        /* Címek és Tailwind felülírások */
        h1, h2, h3, h4, th, .text-white, strong, [className*="text-zinc-100"] { 
          color: var(--text-heading) !important; 
        }
        p, span:not([className*="rounded-"]), label, td, [className*="text-zinc-400"] { 
          color: var(--text-body) !important; 
        }

        /* Akciógombok */
        button[type="submit"], .bg-emerald-500, .bg-blue-600, .bg-purple-600, .bg-primary-btn {
          background-color: var(--accent) !important;
          color: #000000 !important;
          font-weight: 900 !important;
          border-radius: var(--radius) !important;
          border: none !important;
          ${isNeon ? `box-shadow: 0 0 15px \${accent}60 !important;` : ""}
        }

        /* Kártya stílusok dinamikus generálása a dashboardon */
        div[className*="rounded-xl"], .bg-zinc-900, .bg-zinc-900\\/50 {
          background-color: var(--card) !important;
          border-radius: var(--radius) !important;
          border: 1px solid ${textHeading}15 !important;
          box-shadow: ${shadow} !important;
          ${isGlass ? `backdrop-filter: blur(\${glass}) !important;` : ""}
        }

        /* Kompakt UI kapcsoló */
        ${isCompact ? "main { padding: 1.5rem !important; } div, p, td { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }" : ""}
        
        /* Magas kontraszt mód */
        ${isHighContrast ? "body * { border-color: #FFFFFF !important; font-weight: 600 !important; }" : ""}
      `}} />

      {/* BAL OLDALI REPREZENTATÍV MENÜ */}
      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ borderColor: `${textHeading}10`, backgroundColor: "rgba(0,0,0,0.05)" }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b pb-4" style={{ borderColor: `${textHeading}10` }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain" />
            ) : (
              <span className="text-lg font-black tracking-tight" style={{ color: textHeading }}>
                <span style={{ color: primary }}>⚡</span> {kennelName}
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-1.5">
            <Link href="/dashboard" className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5" style={{ color: textHeading }}>📊 Dashboard</Link>
            <Link href="/dogs" className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5" style={{ color: textHeading }}>🐕 Kutyák</Link>
            <Link href="/heats" className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5" style={{ color: textHeading }}>🩸 Tüzelések</Link>
            <Link href="/litters" className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5" style={{ color: textHeading }}>🐾 Almok</Link>
            <Link href="/settings/branding" className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-white/5" style={{ color: textHeading }}>🎨 Branding & Stílus</Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

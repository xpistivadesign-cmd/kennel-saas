import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  royal_purple: { bg: "#0d0814", accent: "#a855f7", heading: "#ffffff", body: "#e9d5ff", cDash: "#1a0f30", cDogs: "#111827", cHeats: "#2d0b1e", cFin: "#062419" },
  midnight_neon: { bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa", cDash: "#16161a", cDogs: "#16161a", cHeats: "#1f0814", cFin: "#041910" },
  luxury_gold: { bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa", cDash: "#1c1c1c", cDogs: "#1c1c1c", cHeats: "#2a1a08", cFin: "#1c1c1c" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const branding = brandingData?.[0] || null;

  const currentPresetKey = branding?.preset_palette || "royal_purple";
  const themeMode = branding?.theme_mode || "preset";
  const isPreset = themeMode === "preset";
  
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.royal_purple;

  // Globális színek
  const bgColor = (isPreset || !branding?.bg_color) ? presetData.bg : branding.bg_color;
  const accentColor = (isPreset || !branding?.accent_color) ? presetData.accent : branding.accent_color;
  const headingColor = branding?.text_heading_color || presetData.heading;
  const bodyColor = branding?.text_body_color || presetData.body;
  
  // EGYEDI KÁRTYASZÍNEK DINAMIKUS BEOLVASÁSA
  const cardDashboardColor = (isPreset || !branding?.card_dashboard_color) ? presetData.cDash : branding.card_dashboard_color;
  const cardDogsColor = (isPreset || !branding?.card_dogs_color) ? presetData.cDogs : branding.card_dogs_color;
  const cardHeatsColor = (isPreset || !branding?.card_heats_color) ? presetData.cHeats : branding.card_heats_color;
  const cardFinanceColor = (isPreset || !branding?.card_finance_color) ? presetData.cFin : branding.card_finance_color;

  const kennelName = branding?.kennel_name || "Kennel OS";
  const logoUrl = branding?.logo_url || null;
  const iconStyle = branding?.icon_style || "glass-box";
  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || "Tenyésztő";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: bgColor, color: bodyColor }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;900&display=swap" />

      {/* 🔮 AGRESSZÍV DINAMIKUS WHITE-LABEL KÁRTYA GENERÁTOR */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, html { background-color: ${bgColor} !important; font-family: 'Poppins', sans-serif !important; }
        h1, h2, h3, h4, th, .text-white, strong { color: ${headingColor} !important; }
        
        /* Gombok */
        button[type="submit"], .bg-emerald-500, .bg-blue-500, .bg-blue-600, button:contains("MENTÉS") {
          background-color: ${accentColor} !important;
          color: #000000 !important;
          font-weight: 900 !important;
        }

        /* ⬛ ALAPÉRTELMEZETT KÁRTYÁK */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .rounded-xl.border, .border-zinc-800 {
          background-color: ${cardDashboardColor} !important; 
          border: 1px solid rgba(255,255,255,0.08) !important;
        }

        /* 🖥️ DASHBOARD KÁRTYÁK (Csak a dashboard aloldalon) */
        main[className*="p-10"] .grid, url*="dashboard" .bg-zinc-900 {
          background-color: ${cardDashboardColor} !important;
        }

        /* 🐕 DOGS KÁRTYÁK HÁTTÉRSZÍNE (Te állítod be!) */
        div:contains("Male"), div:contains("Female"), div:contains("Breed"), div:contains("DOGS DIRECTORY") {
          background-color: ${cardDogsColor} !important;
        }

        /* 🩸 HEATS (TÜZELÉSEK) KÁRTYÁK HÁTTÉRSZÍNE (Te állítod be!) */
        div:contains("HEAT CYCLES"), div:contains("Ciklus"), div:contains("Tüzelés") {
          background-color: ${cardHeatsColor} !important;
        }

        /* 🟢 FINANCE (PÉNZÜGY) KÁRTYÁK HÁTTÉRSZÍNE (Te állítod be!) */
        div:contains("Finance & Analytics"), div:contains("Revenue"), div:contains("Expense"), div:contains("Transaction") {
          background-color: ${cardFinanceColor} !important;
        }
      `}} />

      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r border-white/5" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
            {logoUrl ? <img src={logoUrl} alt="Logo" className="h-10 max-w-[180px] object-contain" /> : <span className="text-xl font-black">{kennelName}</span>}
          </div>
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold">✨ {userGreetingName}</div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">{item.icon}</span>
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

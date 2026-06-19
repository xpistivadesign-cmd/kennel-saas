import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  deep_burgundy: { bg: "#0E0D0D", heading: "#EEDCC1", body: "#A89A8D", card: "#EEDCC1", btnText: "#FFFFFF", accent: "#5E001A" },
  royal_navy: { bg: "#1F2A44", heading: "#E8DCC8", body: "#94A3B8", card: "#E8DCC8", btnText: "#000000", accent: "#C6A75E" },
  cyber_neon: { bg: "#0E48C1", heading: "#3DF8F8", body: "#E0A0FF", card: "#3DF8F8", btnText: "#FFFFFF", accent: "#E23AFB" },
  neon_lime: { bg: "#111217", heading: "#FEFFFC", body: "#94949E", card: "#FEFFFC", btnText: "#000000", accent: "#DDFF00" },
  behance_pastel: { bg: "#F5F5F5", heading: "#5A4EFF", body: "#4B5563", card: "#5A4EFF", btnText: "#FFFFFF", accent: "#EEA0FF" },
  travel_app: { bg: "#F5F5F5", heading: "#1F2937", body: "#6B7280", card: "#1F2937", btnText: "#000000", accent: "#E2F4A6" },
  royal_gold_dark: { bg: "#09090B", heading: "#D4A45A", body: "#A1A1AA", card: "#D4A45A", btnText: "#000000", accent: "#F4D58D" },
  imperial_purple: { bg: "#0E081A", heading: "#C084FC", body: "#A78BFA", card: "#C084FC", btnText: "#FFFFFF", accent: "#7C3AED" },
  bordeaux_velvet: { bg: "#14070B", heading: "#F472B6", body: "#FDA4AF", card: "#F472B6", btnText: "#FFFFFF", accent: "#A11A4B" },
  forest_elite: { bg: "#07100A", heading: "#81C784", body: "#A7F3D0", card: "#81C784", btnText: "#FFFFFF", accent: "#2E7D32" },
  sandstone_luxury: { bg: "#12100D", heading: "#E7CFA4", body: "#D1B894", card: "#E7CFA4", btnText: "#000000", accent: "#C19A6B" },
  graphite_monochrome: { bg: "#09090B", heading: "#FFFFFF", body: "#71717A", card: "#FFFFFF", btnText: "#000000", accent: "#FFFFFF" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase.from("branding_settings").select("*").eq("user_id", user.id);
  const branding = brandingData?.[0] || null;

  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "deep_burgundy";
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.deep_burgundy;

  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#0A0B0F");
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#8B8D98");
  const headingColor = isPreset ? presetData.heading : (branding?.text_heading_color || "#FFFFFF");
  const bodyColor = isPreset ? presetData.body : (branding?.text_body_color || "#A1A1AA");
  const cardTextColor = isPreset ? presetData.card : (branding?.text_card_color || "#FFFFFF");
  const btnTextColor = isPreset ? presetData.btnText : (branding?.text_btn_color || "#000000");

  const googleFontName = branding?.google_font_name || "Inter";
  const kennelName = branding?.kennel_name || "Kennel OS";
  const logoUrl = branding?.logo_url || null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: bgColor, color: bodyColor, fontFamily: `'${googleFontName}', sans-serif` }}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;600;900&display=swap`} />

      <style dangerouslySetInnerHTML={{ __html: `
        /* Globális kényszerített Tailwind felülírások */
        body, html, main, div[className*="bg-zinc-"], div[className*="bg-slate-"] { 
          background-color: ${bgColor} !important; 
        }
        
        /* Szövegek kényszerítése szintenként */
        h1, h2, h3, h4, th, td[className*="text-white"], .text-white, h1 *, h2 *, h3 * { 
          color: ${headingColor} !important; 
        }
        p, span:not([className*="rounded-"]), label, li, td, .text-zinc-400, .text-zinc-300 { 
          color: ${bodyColor} !important; 
        }
        
        /* Kártyák belső feliratainak kényszerítése */
        div[className*="rounded-xl"] span, div[className*="rounded-2xl"] p, .card-text {
          color: ${cardTextColor} !important;
        }

        /* Akciógombok, mentések, hozzáadások kényszerítése */
        button[type="submit"], .bg-emerald-500, .bg-blue-600, .bg-purple-600, 
        button:contains("+"), button:contains("Hozzáadás"), button:contains("Mentés") {
          background-color: ${accentColor} !important;
          color: ${btnTextColor} !important;
          font-weight: 900 !important;
          border: none !important;
        }

        /* Kártyák transzparens beolvasztása a háttérbe a főcímszín 8%-os vetületével */
        .bg-zinc-950, .bg-zinc-900, .bg-zinc-900\\/50, .bg-black, .bg-zinc-800, .border-zinc-800, div[className*="border-zinc-"] {
          background-color: ${headingColor}0d !important;
          border-color: ${headingColor}15 !important;
        }

        /* Inputok és select mezők idomítása */
        input, select, textarea {
          background-color: ${headingColor}05 !important;
          border: 1px solid ${headingColor}1a !important;
          color: ${headingColor} !important;
        }
        input:focus, select:focus {
          border-color: ${accentColor} !important;
        }
      `}} />

      <aside className="w-64 shrink-0 p-6 flex flex-col justify-between border-r" style={{ backgroundColor: "rgba(0,0,0,0.1)", borderColor: `${headingColor}0d` }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b pb-4" style={{ borderColor: `${headingColor}0d` }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-9 max-w-[180px] object-contain rounded" />
            ) : (
              <span className="text-lg font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>
          <nav className="flex flex-col gap-1.5">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: headingColor }}>📊 Dashboard</Link>
            <Link href="/dogs" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: headingColor }}>🐕 Kutyák</Link>
            <Link href="/heats" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: headingColor }}>🩸 Tüzelések</Link>
            <Link href="/litters" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: headingColor }}>🐾 Almok</Link>
            <Link href="/settings/branding" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold" style={{ color: headingColor }}>🎨 Branding & Stílus</Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

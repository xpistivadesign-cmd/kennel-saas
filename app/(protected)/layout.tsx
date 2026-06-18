import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  royal_purple: { bg: "#ba24ff", accent: "#eab308", heading: "#ffffff", body: "#f3e8ff" },
  midnight_neon: { bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa" },
  luxury_gold: { bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa" },
  soft_beige: { bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: branding } = await supabase.from("branding_settings").select("*").eq("user_id", user.id).single();

  const isPreset = (branding?.theme_mode || "preset") === "preset";
  const currentPresetKey = branding?.preset_palette || "royal_purple";
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.royal_purple;

  const bgColor = isPreset ? presetData.bg : (branding?.bg_color || "#09090b");
  const accentColor = isPreset ? presetData.accent : (branding?.accent_color || "#3b82f6");
  const headingColor = isPreset ? presetData.heading : (branding?.text_heading_color || "#ffffff");
  const bodyColor = isPreset ? presetData.body : (branding?.text_body_color || "#a1a1aa");

  const googleFontName = branding?.google_font_name || "Inter";
  const logoUrl = branding?.logo_url || null;
  const kennelName = branding?.kennel_name || "Kennel OS";
  const iconStyle = branding?.icon_style || "minimal";

  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  const isLight = yiq >= 128;

  const borderOverlay = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.07)";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dogs", label: "Dogs", icon: "🐕" },
    { href: "/heats", label: "Heats", icon: "🩸" },
    { href: "/litters", label: "Litters", icon: "🐾" },
    { href: "/shows", label: "Shows", icon: "🏆" },
    { href: "/buyers", label: "Buyers & Waitlist", icon: "👥" },
    { href: "/finance", label: "Finance", icon: "💰" },
    { href: "/settings/branding", label: "Branding & Style", icon: "🎨" },
  ];

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex transition-all duration-200" style={{ backgroundColor: bgColor, color: bodyColor, fontFamily: `'${googleFontName}', sans-serif` }}>
      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${googleFontName.replace(/ /g, "+")}:wght@400;500;700;900&display=swap`} />

      {/* 🔮 LÜKTETŐ, SZEPARÁLT DYNAMIC CARDS CSS INJEKCIÓ */}
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, th, .text-white, strong { color: ${headingColor} !important; }
        p, span, td, label, .text-zinc-400 { color: ${bodyColor} !important; }
        
        /* Fő mentés és akciógombok */
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500, .bg-lime-500,
        button:contains("+"), button:contains("MENTÉS") { 
          background-color: ${accentColor} !important; 
          color: ${isLight ? '#000000' : '#ffffff'} !important;
          border-color: ${accentColor} !important;
          font-weight: 800 !important;
          box-shadow: 0 4px 14px ${accentColor}40 !important;
        }

        /* 🪐 1. ALAPÉRTELMEZETT JÓL KINÉZŐ ÜVEGHATÁSÚ ALAP KÁRTYÁK */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .rounded-xl.border, .rounded-2xl.border {
          background-color: ${isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)'} !important;
          border-color: ${borderOverlay} !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02) !important;
          transition: all 0.25s ease-in-out !important;
        }

        /* 🔥 2. SÜRGŐS / FIGYELMEZTETŐ / KÖZELGŐ ESEMÉNYEK KÁRTYÁI (Borostyán Sárga lüktetés) */
        div[className*="border-amber"], div:contains("SÜRGŐS"), div:contains("⚠️"), div:contains("Optimal") {
          background-color: ${isLight ? 'rgba(217, 119, 6, 0.07)' : 'rgba(245, 158, 11, 0.06)'} !important;
          border-left: 4px solid #f59e0b !important;
          border-color: rgba(245, 158, 11, 0.2) !important;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.05) !important;
        }

        /* 🟢 3. BEVÉTELEK / FINANCES / PROFI KÁRTYÁK (Sápadt smaragd zöld lüktetés) */
        div[className*="text-emerald"], div:contains("Income"), div:contains("Total Income"), div:contains("Revenue") {
          background-color: ${isLight ? 'rgba(16, 185, 129, 0.07)' : 'rgba(16, 185, 129, 0.05)'} !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
        }
        div:contains("Income") .text-white, div:contains("Revenue") {
          color: #34d399 !important;
        }

        /* 🔴 4. KIADÁSOK / SZUKÁK / TÜZELÉSEK KÁRTYÁI (Sápadt vörös/magenta lüktetés) */
        div[className*="text-red"], div:contains("Expense"), div:contains("Total Expense"), div:contains("Heats"), div:contains("🔴") {
          background-color: ${isLight ? 'rgba(239, 68, 68, 0.07)' : 'rgba(244, 63, 94, 0.05)'} !important;
          border-color: rgba(244, 63, 94, 0.2) !important;
        }

        /* 🐕 5. KAN KUTYÁK / MEGTÉRÜLÉSEK KÁRTYÁI (Sápadt prémium kék lüktetés) */
        div:contains("Male"), div:contains("Net Profit") {
          background-color: ${isLight ? 'rgba(59, 130, 246, 0.07)' : 'rgba(59, 130, 246, 0.05)'} !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }

        /* 🪄 Finom hover effektus a kártyákra, amitől életre kel a felület */
        .bg-zinc-950:hover, .bg-black:hover, .rounded-xl.border:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.12) !important;
          border-color: ${accentColor}30 !important;
        }
        
        /* Űrlapok stílusa */
        input, select, textarea { 
          background-color: ${isLight ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.3)'} !important; 
          color: ${headingColor} !important; 
          border-color: ${borderOverlay} !important; 
        }
      `}} />

      <aside className="w-64 shrink-0 border-r flex flex-col justify-between p-6" style={{ backgroundColor: bgColor, borderColor: borderOverlay }}>
        <div>
          {/* LOGÓ */}
          <div className="mb-8 tracking-wide flex items-center gap-2 border-b pb-4" style={{ borderColor: borderOverlay }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-8 max-w-[180px] object-contain rounded" />
            ) : (
              <span className="text-base font-black flex items-center gap-1.5" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          {/* ÜDVÖZLET */}
          <div className="mb-6 p-3 rounded-xl border" style={{ backgroundColor: cardOverlay, borderColor: borderOverlay }}>
            <span className="text-[9px] block uppercase tracking-wider font-bold opacity-60">Tenyészet</span>
            <div className="text-xs font-bold mt-0.5" style={{ color: headingColor }}>✨ Welcome, {userGreetingName}! 👋</div>
          </div>

          {/* NAVIGÁCIÓ */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs hover:bg-zinc-800/10 transition-all">
                {iconStyle === "minimal" && <span className="text-sm opacity-70">{item.icon}</span>}
                {iconStyle === "neon" && <span className="text-sm" style={{ color: accentColor, filter: `drop-shadow(0 0 4px ${accentColor})` }}>{item.icon}</span>}
                {iconStyle === "glass-box" && (
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{ backgroundColor: `${accentColor}25`, border: `1px solid ${accentColor}40` }}>
                    {item.icon}
                  </span>
                )}
                <span className="font-bold" style={{ color: headingColor }}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full px-3 py-2 rounded-lg border text-xs transition-all" style={{ backgroundColor: cardOverlay, borderColor: borderOverlay, color: headingColor }}>
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-8">{children}</main>
    </div>
  );
}

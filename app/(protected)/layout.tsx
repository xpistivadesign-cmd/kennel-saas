import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const SERVER_PRESETS = {
  royal_purple: { bg: "#0d0814", accent: "#a855f7", heading: "#ffffff", body: "#e9d5ff" },
  midnight_neon: { bg: "#09090b", accent: "#6df73b", heading: "#ffffff", body: "#a1a1aa" },
  luxury_gold: { bg: "#141414", accent: "#dca54e", heading: "#fafaf9", body: "#a1a1aa" },
  soft_beige: { bg: "#f5f5f4", accent: "#78716c", heading: "#1c1917", body: "#44403c" },
};

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brandingData } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id);

  const branding = brandingData?.[0] || null;

  const currentPresetKey = branding?.preset_palette || "royal_purple";
  const themeMode = branding?.theme_mode || "preset";
  const isPreset = themeMode === "preset";
  
  const presetData = SERVER_PRESETS[currentPresetKey as keyof typeof SERVER_PRESETS] || SERVER_PRESETS.royal_purple;

  const bgColor = (isPreset || !branding?.bg_color || branding.bg_color === "#000000") ? presetData.bg : branding.bg_color;
  const accentColor = (isPreset || !branding?.accent_color || branding.accent_color === "#000000") ? presetData.accent : branding.accent_color;
  const headingColor = branding?.text_heading_color || presetData.heading;
  const bodyColor = branding?.text_body_color || presetData.body;
  
  const kennelName = branding?.kennel_name || "Kennel OS";
  const logoUrl = branding?.logo_url || null;
  const iconStyle = branding?.icon_style || "glass-box";

  const userGreetingName = branding?.owner_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Tenyésztő";

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
    <div className="min-h-screen flex transition-all duration-300" style={{ backgroundColor: bgColor, color: bodyColor }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;900&display=swap" />

      {/* 🔮 PRÉMIUM WHITE-LABEL DIGITÁLIS SÉMA FELÜLBÍRÁLÁS */}
      <style dangerouslySetInnerHTML={{ __html: `
        body, html { background-color: ${bgColor} !important; font-family: 'Poppins', sans-serif !important; }
        
        h1, h2, h3, h4, .text-white, strong, b, th { color: ${headingColor} !important; }
        p, span, td, label, li, .text-zinc-400, .text-zinc-300 { color: ${bodyColor} !important; }

        /* Fő gombok igazítása az arculati színhez */
        button[type="submit"], .bg-emerald-500, .bg-blue-500, .bg-blue-600, .bg-zinc-100, 
        button.bg-black.text-white, .bg-indigo-600, button:contains("MENTÉS"), button:contains("ESEMÉNY") {
          background-color: ${accentColor} !important;
          color: #000000 !important;
          border: none !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          box-shadow: 0 4px 20px ${accentColor}33 !important;
        }

        /* ⬛ ALAP KÁRTYÁK STÍLUSA (Zárt, mélygrafit kártyák, hogy elváljanak a háttértől) */
        .bg-zinc-950, .bg-zinc-900, .bg-black, .bg-zinc-800, .bg-zinc-800\\/50, .rounded-xl.border, .border-zinc-800 {
          background-color: #16161a !important;
          border: 1px solid #24242b !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
        }

        /* 🔲 PRÉMIUM IKON DOBOROK (Mint a RoyalPaws képen - kis színes boxok az emoji/ikon mögé) */
        aside span[className*="rounded-lg"] {
          background-color: ${accentColor}20 !important;
          border: 1px solid ${accentColor}40 !important;
        }

        /* 🐕 KAN KUTYÁK (Mély tengerészkék kártyák, intenzív kék kontúrral a directory-ban) */
        div:contains("Male"), td:contains("Male"), div:contains("• Male") {
          background-color: #0d1527 !important;
          border-color: #2563eb !important;
        }

        /* 🩸 SZUKÁK / TÜZELÉSEK / METRIKÁK (Mély fukszia/bordó tömb, pink kontúrral) */
        div:contains("Female"), div:contains("Heats"), div:contains("🔴"), div:contains("Tüzelés"), div:contains("Active Dogs"), div:contains("Total Dogs") {
          background-color: #1f0814 !important;
          border-color: #db2777 !important;
        }

        /* ⚠️ SÜRGŐS FIGYELMEZTETÉSEK / ATTENTION / TEENDŐK (Mély csokoládé barna, narancs kontúrral) */
        div:contains("⚠️"), div:contains("SÜRGŐS"), div:contains("Optimal"), div:contains("Attention"), div:contains("TEENDŐ") {
          background-color: #1f1105 !important;
          border-left: 5px solid #d97706 !important;
          border-color: #d97706 !important;
        }

        /* 🟢 BEVÉTELEK / FINANCE METRIKÁK (Mély erdőzöld tömb, smaragd kontúrral) */
        div:contains("Income"), div:contains("Total Income"), div:contains("Revenue"), div:contains("🟢") {
          background-color: #041910 !important;
          border-color: #059669 !important;
        }

        /* 🔴 KIADÁSOK / EXPENSES (Mély vörös tömb, skarlátvörös kontúrral) */
        div:contains("Expense"), div:contains("Total Expense"), div:contains("Expenses") {
          background-color: #1f0707 !important;
          border-color: #dc2626 !important;
        }

        /* Inputok */
        input, select, textarea {
          background-color: #0f0f12 !important;
          border: 1px solid #24242b !important;
          color: #ffffff !important;
        }
      `}} />

      <aside className="w-64 shrink-0 border-r flex flex-col justify-between p-6" style={{ backgroundColor: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.05)" }}>
        <div>
          <div className="mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-10 max-w-[180px] object-contain" />
            ) : (
              <span className="text-xl font-black" style={{ color: headingColor }}>
                <span style={{ color: accentColor }}>🐾</span> {kennelName}
              </span>
            )}
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] uppercase font-bold opacity-40 block">Tenyészet</span>
            <div className="text-sm font-black mt-1" style={{ color: headingColor }}>✨ {userGreetingName}</div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:bg-white/5">
                {iconStyle === "glass-box" ? (
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">{item.icon}</span>
                ) : (
                  <span>{item.icon}</span>
                )}
                <span className="font-bold">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button type="submit" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-red-500/20 transition-all">
            Kijelentkezés
          </button>
        </form>
      </aside>

      <main className="flex-1 min-w-0 p-10 overflow-y-auto">{children}</main>
    </div>
  );
}

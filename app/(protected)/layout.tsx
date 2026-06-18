import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Lekérjük a felhasználó egyedi arculati beállításait
  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Ha még nincsenek beállításai, alapértelmezett értékeket használunk
  const accentColor = branding?.accent_color || "#3b82f6";
  const bgStyle = branding?.bg_style || "zinc";
  const fontFamily = branding?.font_family || "sans";
  const logoUrl = branding?.logo_url || null;

  // Navigációs menüpontok (kiegészítve az új Arculat menüponttal)
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dogs", label: "Dogs" },
    { href: "/heats", label: "Heats" },
    { href: "/litters", label: "Litters" },
    { href: "/shows", label: "Shows" },
    { href: "/buyers", label: "Buyers & Waitlist" },
    { href: "/finance", label: "Finance" },
    { href: "/settings/branding", label: "🎨 Branding & Style" }, // ÚJ TESTRESZABÓ MENÜPONT
  ];

  // Háttérszín és oldalkeret CSS osztályok meghatározása a téma szerint
  let bgMainClass = "bg-zinc-950";
  let bgAsideClass = "bg-zinc-950 border-zinc-800";
  if (bgStyle === "pitch-black") {
    bgMainClass = "bg-black";
    bgAsideClass = "bg-black border-zinc-900";
  } else if (bgStyle === "slate") {
    bgMainClass = "bg-slate-950";
    bgAsideClass = "bg-slate-950 border-slate-900";
  }

  // Globális betűtípus osztály meghatározása
  let fontClass = "font-sans";
  if (fontFamily === "mono") fontClass = "font-mono";
  if (fontFamily === "serif") fontClass = "font-serif";

  async function signOut() {
    "use server";
    const supabase = createServerSupabase();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className={`min-h-screen flex ${bgMainClass} text-white ${fontClass}`}>
      {/* 🛠️ INJEKTÁLT DINAMIKUS CSS A WHITE-LABEL MŰKÖDÉSHEZ */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Dinamikus gomb és kiemelő háttérstílusok */
        .custom-accent-bg { background-color: ${accentColor} !important; }
        .custom-accent-text { color: ${accentColor} !important; }
        .custom-accent-border { border-color: ${accentColor} !important; }
        
        /* Felülírjuk az összes meglévő zöld/kék mentés gombot az appban, hogy kövesse az arculatot! */
        button[type="submit"]:not(.bg-zinc-900):not(.bg-red-500), 
        .bg-emerald-500, .bg-blue-500 { 
          background-color: ${accentColor} !important; 
          color: black !important;
        }
      `}} />

      <aside className={`w-64 shrink-0 border-r flex flex-col justify-between p-6 ${bgAsideClass}`}>
        <div>
          {/* LOGÓ VAGY SZÖVEG MEGJELENÍTÉSE */}
          <div className="mb-8 tracking-wide flex items-center gap-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt="Kennel Logo" 
                className="h-8 max-w-[180px] object-contain"
                onError={(e) => { 
                  // Ha hibás lenne a kép URL-je, visszaállunk a szövegre automtizáltan
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-xl font-black text-white flex items-center gap-1.5">
                <span className="text-xs" style={{ color: accentColor }}>🐾</span> Kennel OS
              </span>
            )}
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-900/60 hover:text-white transition"
                style={{ '--hover-color': accentColor } as React.CSSProperties}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition font-sans"
          >
            Sign Out
          </button>
        </form>
      </aside>

      <main className={`flex-1 min-w-0 p-8 ${bgMainClass}`}>{children}</main>
    </div>
  );
}

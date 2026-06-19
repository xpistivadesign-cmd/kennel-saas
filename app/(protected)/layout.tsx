import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

import {
  THEMES,
  buildThemeTokens,
} from "@/lib/theme/tokens";

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

  const { data: branding } = await supabase
    .from("branding_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const theme = buildThemeTokens(
    branding || {
      preset_palette: "midnight",
      theme_mode: "dark",
      ui_style: "glass",
      ui_radius: "medium",
      ui_animation: "normal",
      ui_density: "balanced",
    }
  );

  // 🐾 AZ IGAZI, EREDETI MENÜPONTOK TŰPONTOS ÚTVONALAKKAL
  const navItems = [
    { href: "/dashboard", label: "📊 Dashboard" },
    { href: "/dogs", label: "🐕 Kutyák" },
    { href: "/heats", label: "🩸 Tüzelések" },
    { href: "/litters", label: "🐾 Almok" },
    { href: "/shows", label: "🏆 Shows" },
    { href: "/buyers", label: "👥 Buyers & Waitlist" },
    { href: "/finance", label: "💰 Finance" },
    { href: "/settings/branding", label: "🎨 Branding & Stílus" },
  ];

  return (
    <div className="app-shell">
      <style
        dangerouslySetInnerHTML={{
          __html: `
:root {
  --primary: ${theme.primary};
  --accent: ${theme.accent};
  --bg: ${theme.bg};
  --surface: ${theme.surface};
  --text: ${theme.text};
  --card-1: ${theme.card1};
  --card-2: ${theme.card2};
  --card-3: ${theme.card3};
  --radius: ${theme.radius};
  --transition: ${theme.transition};
  --glass: ${theme.glass};
  --glow: ${theme.glow};
  --sidebar: ${theme.sidebar};
  --gradient: linear-gradient(135deg, ${theme.primary}20, ${theme.accent}10);
}

html { background: var(--bg); }

body {
  margin: 0;
  background: radial-gradient(circle at top, ${theme.primary}08, transparent 45%), radial-gradient(circle at bottom, ${theme.accent}08, transparent 45%), var(--bg);
  color: var(--text);
  font-family: Inter, sans-serif;
  transition: all var(--transition);
}

* { box-sizing: border-box; }
.app-shell { display: flex; min-height: 100vh; }

.sidebar {
  width: 270px;
  background: var(--sidebar);
  border-right: 1px solid rgba(255,255,255,.06);
  backdrop-filter: blur(20px);
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: var(--radius);
  color: var(--text);
  text-decoration: none;
  transition: all var(--transition);
}

.sidebar-link:hover {
  background: rgba(255,255,255,.04);
  transform: translateX(3px);
}

.main { flex: 1; padding: 36px; }

.card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 24px;
  border: 1px solid rgba(255,255,255,.05);
  transition: all var(--transition);
}

.glass .card { background: var(--glass); backdrop-filter: blur(18px); }
.neon .card { box-shadow: 0 0 40px ${theme.primary}18; }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.dashboard-grid .card:nth-child(1) { background: var(--card-1); }
.dashboard-grid .card:nth-child(2) { background: var(--card-2); }
.dashboard-grid .card:nth-child(3) { background: var(--card-3); }

button {
  background: var(--gradient);
  border: none;
  border-radius: var(--radius);
  padding: 14px 20px;
  font-weight: 800;
  color: white;
  cursor: pointer;
}

input, textarea, select {
  background: rgba(255, 255, 255, .03);
  color: var(--text);
  border: 1px solid rgba(255, 255, 255, .08);
  padding: 14px;
  border-radius: var(--radius);
  width: 100%;
}

h1, h2, h3 { color: var(--text); }
`,
        }}
      />

      <aside className={`sidebar ${theme.style}`}>
        <div style={{ padding: 30 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 40 }}>
            ⚡ {branding?.kennel_name || "Kennel"}
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href} // <-- Tiszta, abszolút Next.js útvonal!
                className="sidebar-link"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className={`main ${theme.style}`}>
        {children}
      </main>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase.from("dashboard_settings").select("*").eq("user_id", user?.id).maybeSingle();

  async function saveDashboardConfig(fd: FormData) {
    "use server";
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      widget_dogs: fd.get("widget_dogs") === "true",
      widget_litters: fd.get("widget_litters") === "true",
      widget_heats: fd.get("widget_heats") === "true",
      widget_revenue: fd.get("widget_revenue") === "true",
      widget_calendar: fd.get("widget_calendar") === "true",
      widget_births: fd.get("widget_births") === "true",
      layout_type: fd.get("layout_type")?.toString() || "grid",
      header_style: fd.get("header_style")?.toString() || "welcome",
      updated_at: new Date().toISOString()
    };

    await supabase.from("dashboard_settings").upsert(payload, { onConflict: "user_id" });
    revalidatePath("/dashboard");
  }

  return (
    <form action={saveDashboardConfig} className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">📊 Dashboard Architecture & Layout</h1>
        <p className="opacity-50 text-xs">Vezéreld a főoldali widgetek láthatóságát, rácselrendezéseit és a fejléc fókuszát.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WIDGETEK */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-sm text-purple-400">Active Widgets</h3>
          <div className="space-y-2">
            {["dogs", "litters", "heats", "revenue", "calendar", "births"].map(w => (
              <label key={w} className="flex items-center gap-3 cursor-pointer capitalize">
                <input type="checkbox" name={`widget_${w}`} value="true" defaultChecked={config ? config[`widget_${w}`] !== false : true} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
                <span>{w} widget megjelenítése</span>
              </label>
            ))}
          </div>
        </div>

        {/* ELRENDEZÉSEK */}
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-sm text-lime-400">Rácsstruktúra & Elrendezés</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] block mb-1">Layout Engine</label>
              <select name="layout_type" defaultValue={config?.layout_type || "grid"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                <option value="grid">Standard Matrix Grid</option>
                <option value="masonry">Masonry Flex</option>
                <option value="sidebar">Sidebar Master Layout</option>
                <option value="bento">Bento Grid Premium</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] block mb-1">Dashboard Header</label>
              <select name="header_style" defaultValue={config?.header_style || "welcome"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
                <option value="welcome">Welcome dynamic text</option>
                <option value="weather">Weather interface</option>
                <option value="quote">Daily quote focus</option>
                <option value="logo">Branded Kennel Logo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider">
        💾 DASHBOARD RÁCSSTRUKTÚRA MENTÉSE
      </button>
    </form>
  );
}

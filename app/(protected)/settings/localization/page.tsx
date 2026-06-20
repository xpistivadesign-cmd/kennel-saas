import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function LocalizationPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase.from("localization_settings").select("*").eq("user_id", user?.id).maybeSingle();

  async function saveLocalization(fd: FormData) {
    "use server";
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      language: fd.get("language")?.toString() || "hu",
      timezone: fd.get("timezone")?.toString() || "Europe/Budapest",
      currency: fd.get("currency")?.toString() || "EUR",
      updated_at: new Date().toISOString()
    };

    await supabase.from("localization_settings").upsert(payload, { onConflict: "user_id" });
    revalidatePath("/", "layout");
  }

  return (
    <form action={saveLocalization} className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🌍 Localization & Region</h1>
        <p className="opacity-50 text-xs">Nyelvi lokalizáció, időzónák és pénzügyi pénznem-tokenek kalibrációja.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] block mb-1">System Language</label>
            <select name="language" defaultValue={config?.language || "hu"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
              <option value="hu">Magyar (HU)</option>
              <option value="en">English (US/UK)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] block mb-1">Currency (Pénznem)</label>
            <select name="currency" defaultValue={config?.currency || "EUR"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
              <option value="HUF">Forint (HUF)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] block mb-1">Timezone</label>
          <select name="timezone" defaultValue={config?.timezone || "Europe/Budapest"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
            <option value="Europe/Budapest">Europe/Budapest (GMT+1)</option>
            <option value="UTC">UTC / GMT Universal</option>
          </select>
        </div>
      </div>

      <button type="submit" className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider">
        💾 LOKALIZÁCIÓS REKORD Mentése
      </button>
    </form>
  );
}

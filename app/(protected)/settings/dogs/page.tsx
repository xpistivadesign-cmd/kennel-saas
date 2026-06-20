import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DogsSettingsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase.from("dog_settings").select("*").eq("user_id", user?.id).maybeSingle();

  async function saveDogSettings(fd: FormData) {
    "use server";
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      weight_unit: fd.get("weight_unit")?.toString() || "kg",
      age_display: fd.get("age_display")?.toString() || "exact",
      row_density: fd.get("row_density")?.toString() || "normal",
      updated_at: new Date().toISOString()
    };

    await supabase.from("dog_settings").upsert(payload, { onConflict: "user_id" });
    revalidatePath("/dogs");
  }

  return (
    <form action={saveDogSettings} className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🐕 Dogs & Tables Configuration</h1>
        <p className="opacity-50 text-xs">Mértékegységek és táblázatok globális viselkedésének konfigurációja.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] block mb-1">Weight Unit</label>
            <select name="weight_unit" defaultValue={config?.weight_unit || "kg"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
              <option value="kg">Kilogramm (kg)</option>
              <option value="lb">Font (lb)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] block mb-1">Age Display</label>
            <select name="age_display" defaultValue={config?.age_display || "exact"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
              <option value="exact">Exact (Év, Hónap, Nap)</option>
              <option value="months">Csak Hónapokban</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] block mb-1">Táblázat Sormagasság (Row Density)</label>
          <select name="row_density" defaultValue={config?.row_density || "normal"} className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-xs">
            <option value="compact">Compact (Sűrű)</option>
            <option value="normal">Normal (Kényelmes)</option>
            <option value="luxury">Luxury (Tágas)</option>
          </select>
        </div>
      </div>

      <button type="submit" className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider">
        💾 KUTYA SPECIFIKUS MÁTRIX MENTÉSE
      </button>
    </form>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: config } = await supabase.from("notification_settings").select("*").eq("user_id", user?.id).maybeSingle();

  async function saveNotifications(fd: FormData) {
    "use server";
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      email_birth: fd.get("email_birth") === "true",
      email_heat: fd.get("email_heat") === "true",
      push_enabled: fd.get("push_enabled") === "true",
      digest_frequency: fd.get("digest_frequency")?.toString() || "weekly",
      updated_at: new Date().toISOString()
    };

    await supabase.from("notification_settings").upsert(payload, { onConflict: "user_id" });
    revalidatePath("/settings/notifications");
  }

  return (
    <form action={saveNotifications} className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🔔 Notifications Engine</h1>
        <p className="opacity-50 text-xs">Rendszerértesítések, kritikus tüzelési riasztások és emlékeztetők kezelése.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-sm text-purple-400">Email Notifications</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="email_birth" value="true" defaultChecked={config ? config.email_birth !== false : true} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
            <span className="text-xs">Ellések és születések</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="email_heat" value="true" defaultChecked={config ? config.email_heat !== false : true} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
            <span className="text-xs">Tüzelési ciklus riasztások</span>
          </label>
        </div>

        <div className="card p-6 space-y-3">
          <h3 className="font-bold text-sm text-lime-400">Push & Digest Layer</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="push_enabled" value="true" defaultChecked={config?.push_enabled === true} className="w-4 h-4 rounded border-zinc-800 bg-black text-purple-600 focus:ring-0" />
            <span className="text-xs">Push értesítések engedélyezése</span>
          </label>
          <div className="pt-2">
            <label className="text-[10px] block mb-1 opacity-50">Összefoglaló (Digest) gyakorisága</label>
            <select name="digest_frequency" defaultValue={config?.digest_frequency || "weekly"} className="w-full bg-black p-2 rounded-xl border border-zinc-800 text-xs">
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Digest</option>
              <option value="off">Kikapcsolva</option>
            </select>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider">
        💾 ÉRTESÍTÉSI PROFIL ÉLESÍTÉSE
      </button>
    </form>
  );
}

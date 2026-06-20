import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function KennelProfilePage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: branding } = await supabase
    .from("branding_settings")
    .select("kennel_name")
    .eq("user_id", user?.id)
    .maybeSingle();

  async function saveProfile(fd: FormData) {
    "use server";
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const kennelName = fd.get("kennel_name")?.toString() || "";

    await supabase
      .from("branding_settings")
      .upsert({ user_id: user.id, kennel_name: kennelName, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    revalidatePath("/", "layout");
  }

  return (
    <form action={saveProfile} className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">🏢 Kennel Profile</h1>
        <p className="opacity-50 text-xs">A tenyészet globális azonosítói és nyilvános adatai.</p>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-[11px] block mb-1 uppercase tracking-wider font-bold opacity-70">A tenyészet hivatalos neve (Kennel Name)</label>
          <input 
            type="text" 
            name="kennel_name" 
            defaultValue={branding?.kennel_name || ""} 
            placeholder="pl. Vom Hause Matrix" 
            className="w-full bg-black p-3 rounded-xl border border-zinc-800 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <button type="submit" className="w-full h-12 rounded-xl bg-lime-300 text-black font-black text-xs uppercase tracking-wider">
        💾 PROFIL ADATOK MENTÉSE
      </button>
    </form>
  );
}

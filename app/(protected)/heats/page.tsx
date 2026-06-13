import { createServerSupabase } from "@/lib/supabase/server";
import { redirect, revalidatePath } from "next/navigation";

export const dynamic = "force-dynamic";

async function createHeat(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const dog_id = String(formData.get("dog_id"));
  const start_date = String(formData.get("start_date"));
  const progesterone = String(formData.get("progesterone"));
  const notes = String(formData.get("notes") || "");

  await supabase.from("heats").insert({
    user_id: user.id,
    dog_id,
    start_date,
    progesterone,
    notes,
    status: "active",
  });

  revalidatePath("/heats");
}

export default async function HeatsPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userId = user.id;

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .eq("user_id", userId)
    .eq("sex", "Female");

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: false });

  return (
    <div className="grid md:grid-cols-2 gap-6 text-white">
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Heat History</h2>

        <div className="space-y-2">
          {heats?.map((h: any) => (
            <div key={h.id} className="p-3 rounded-lg bg-zinc-800">
              <div className="font-semibold">{h.dog_id}</div>
              <div className="text-sm text-zinc-400">
                {h.start_date} • {h.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Log New Heat</h2>

        <form action={createHeat} className="space-y-4">
          <select name="dog_id" className="w-full p-3 bg-zinc-800 rounded-lg">
            {dogs?.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            name="start_date"
            type="date"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <input
            name="progesterone"
            placeholder="Progesterone level"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <button className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl">
            Save Heat
          </button>
        </form>
      </div>
    </div>
  );
}

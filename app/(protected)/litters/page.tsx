import { createServerSupabase } from "@/lib/supabase/server";
import { redirect, revalidatePath } from "next/navigation";

export const dynamic = "force-dynamic";

async function createLitter(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  await supabase.from("litters").insert({
    user_id: user.id,
    name: String(formData.get("name")),
    birth_date: String(formData.get("birth_date")),
    sire_id: String(formData.get("sire_id")),
    dam_id: String(formData.get("dam_id")),
    status: "planned",
  });

  revalidatePath("/litters");
}

export default async function LittersPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userId = user.id;

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .eq("user_id", userId);

  const { data: litters } = await supabase
    .from("litters")
    .select("*")
    .eq("user_id", userId)
    .order("birth_date", { ascending: false });

  return (
    <div className="grid md:grid-cols-2 gap-6 text-white">
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Litters</h2>

        <div className="space-y-2">
          {litters?.map((l: any) => (
            <div
              key={l.id}
              className="p-3 rounded-lg bg-zinc-800"
            >
              <div className="font-semibold">{l.name}</div>
              <div className="text-sm text-zinc-400">
                {l.birth_date} • {l.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-xl font-bold mb-4">Add New Litter</h2>

        <form action={createLitter} className="space-y-4">
          <input
            name="name"
            placeholder="Litter name"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <input
            name="birth_date"
            type="date"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          />

          <select
            name="sire_id"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          >
            {dogs
              ?.filter((d: any) => d.sex === "Male")
              .map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          <select
            name="dam_id"
            className="w-full p-3 bg-zinc-800 rounded-lg"
          >
            {dogs
              ?.filter((d: any) => d.sex === "Female")
              .map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          <button className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl">
            Create Litter
          </button>
        </form>
      </div>
    </div>
  );
}

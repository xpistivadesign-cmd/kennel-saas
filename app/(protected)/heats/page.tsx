import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addHeat(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));
  const date = String(formData.get("date"));

  await supabase.from("heats").insert({
    dog_id,
    start_date: date,
  });

  revalidatePath("/heats");
}

async function addProg(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  await supabase.from("progesterone_tests").insert({
    heat_id: String(formData.get("heat_id")),
    date: String(formData.get("date")),
    value: Number(formData.get("value")),
  });

  revalidatePath("/heats");
}

export default async function Page() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id);

  const { data: heats } = await supabase
    .from("heats")
    .select("*, progesterone_tests(*)")
    .eq("user_id", user.id);

  return (
    <div className="space-y-10 text-white p-8">

      <h1 className="text-3xl font-bold">Heats</h1>

      {(heats || []).map((h: any) => {
        const last = h.progesterone_tests?.slice(-1)[0];

        return (
          <div key={h.id} className="border border-zinc-800 p-4 rounded-xl">
            <div>{h.dog_id}</div>

            {last?.value >= 5 && last?.value <= 10 && (
              <div className="text-green-400 font-bold">
                OPTIMAL MATING WINDOW - OVULATION DETECTED
              </div>
            )}
          </div>
        );
      })}

      <form action={addHeat} className="space-y-2">
        <select name="dog_id" className="p-2 bg-black w-full">
          {(dogs || []).map((d: any) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <input type="date" name="date" className="p-2 bg-black w-full" />

        <button className="bg-amber-500 text-black px-4 py-2">
          Add Heat
        </button>
      </form>

    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addVetVisit(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id") || "");
  const litter_id = String(formData.get("litter_id") || "");
  const date = String(formData.get("date"));
  const purpose = String(formData.get("purpose"));
  const cost = Number(formData.get("cost"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await supabase.from("vet_visits").insert({
    user_id: user.id,
    dog_id: dog_id || null,
    litter_id: litter_id || null,
    date,
    purpose,
    cost,
    status: "planned",
  });

  revalidatePath("/vet");
}

async function markDone(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const visit_id = String(formData.get("visit_id"));
  const cost = Number(formData.get("cost"));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("vet_visits")
    .update({
      status: "done",
    })
    .eq("id", visit_id)
    .eq("user_id", user.id);

  // 🔥 AUTO FINANCE IMPACT (EXPENSE)
  await supabase.from("payments").insert({
    user_id: user.id,
    amount: cost,
    type: "expense",
    category: "Veterinary",
  });

  revalidatePath("/vet");
}

export default async function VetPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name")
    .eq("user_id", user.id);

  const { data: visits } = await supabase
    .from("vet_visits")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: true });

  return (
    <div className="p-8 text-white space-y-10">

      {/* HEADER */}
      <div className="text-3xl font-bold">
        Veterinary Schedule
      </div>

      {/* VISITS LIST */}
      <div className="space-y-3">
        {(visits || []).map((v: any) => (
          <div
            key={v.id}
            className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40"
          >
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">
                  {v.purpose}
                </div>

                <div className="text-sm text-zinc-400">
                  {v.date}
                </div>

                <div className="text-sm text-zinc-500">
                  Cost: {v.cost} €
                </div>
              </div>

              <div className="text-sm">
                {v.status === "done" ? (
                  <span className="text-green-400">
                    Completed
                  </span>
                ) : (
                  <span className="text-yellow-400">
                    Planned
                  </span>
                )}
              </div>
            </div>

            {v.status !== "done" && (
              <form action={markDone} className="mt-3 flex gap-2">
                <input type="hidden" name="visit_id" value={v.id} />
                <input type="hidden" name="cost" value={v.cost} />

                <button className="bg-green-500 text-black px-3 py-1 rounded">
                  Mark as Done
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {/* ADD VISIT FORM */}
      <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40">
        <h2 className="text-xl font-bold mb-4">
          Add Veterinary Visit
        </h2>

        <form action={addVetVisit} className="space-y-3">

          <select
            name="dog_id"
            className="w-full p-2 bg-black rounded"
          >
            <option value="">Select Dog</option>
            {(dogs || []).map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            name="date"
            type="date"
            className="w-full p-2 bg-black rounded"
          />

          <input
            name="purpose"
            placeholder="Purpose (Vaccination, Surgery, etc.)"
            className="w-full p-2 bg-black rounded"
          />

          <input
            name="cost"
            type="number"
            placeholder="Cost"
            className="w-full p-2 bg-black rounded"
          />

          <button className="bg-amber-500 text-black px-4 py-2 rounded">
            Save Visit
          </button>

        </form>
      </div>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type Dog = {
  id: string;
  name: string;
};

type Show = {
  id: string;
  dog_id: string;
  show_name: string;
  show_date: string;
  location: string;
  judge: string;
  class: string;
  placement: string;
  notes: string;
};

async function addShowAction(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id") || "");
  const show_name = String(formData.get("show_name") || "");
  const show_date = String(formData.get("show_date") || "");
  const location = String(formData.get("location") || "");
  const judge = String(formData.get("judge") || "");
  const className = String(formData.get("class") || "");
  const placement = String(formData.get("placement") || "");
  const notes = String(formData.get("notes") || "");

  const { error } = await supabase.from("dog_shows").insert({
    dog_id,
    show_name,
    show_date,
    location,
    judge,
    class: className,
    placement,
    notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/shows");
}

export default async function ShowsPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name")
    .eq("user_id", user.id);

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("user_id", user.id)
    .order("show_date", { ascending: false });

  return (
    <div className="space-y-10 text-white">
      <h1 className="text-3xl font-bold">Shows</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LIST */}
        <div className="space-y-4">
          {(shows || []).map((show: Show) => (
            <div
              key={show.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <div className="text-xl font-semibold">
                {show.show_name}
              </div>
              <div className="text-sm text-zinc-400">
                {show.location} • {show.show_date}
              </div>
              <div className="mt-2 text-sm">
                Dog ID: {show.dog_id}
              </div>
              <div className="text-sm">
                Placement: {show.placement}
              </div>
              <div className="text-sm text-zinc-400">
                {show.notes}
              </div>
            </div>
          ))}
        </div>

        {/* FORM */}
        <form
          action={addShowAction}
          className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6"
        >
          <select
            name="dog_id"
            className="w-full rounded-xl bg-zinc-950 p-3"
            required
          >
            <option value="">Select dog</option>
            {(dogs || []).map((dog: Dog) => (
              <option key={dog.id} value={dog.id}>
                {dog.name}
              </option>
            ))}
          </select>

          <input
            name="show_name"
            placeholder="Show name"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <input
            name="show_date"
            type="date"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <input
            name="location"
            placeholder="Location"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <input
            name="judge"
            placeholder="Judge"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <input
            name="class"
            placeholder="Class"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <input
            name="placement"
            placeholder="Placement"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <textarea
            name="notes"
            placeholder="Notes"
            className="w-full rounded-xl bg-zinc-950 p-3"
          />

          <button className="w-full rounded-xl bg-amber-500 py-3 font-semibold text-black">
            Add Show Achievement
          </button>
        </form>
      </div>
    </div>
  );
}

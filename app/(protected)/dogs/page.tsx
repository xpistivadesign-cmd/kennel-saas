import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-red-400">Not authenticated</div>;
  }

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const maleDogs = dogs?.filter((d) => d.sex === "Male") || [];
  const femaleDogs = dogs?.filter((d) => d.sex === "Female") || [];

  async function addDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("dogs").insert({
      user_id: user.id,
      name: String(formData.get("name") || ""),
      breed: String(formData.get("breed") || ""),
      sex: String(formData.get("sex") || ""),
      birth_date: formData.get("birth_date") || null,
      microchip_id: String(formData.get("microchip_id") || ""),
      passport_number: String(formData.get("passport_number") || ""),
      color_markings: String(formData.get("color_markings") || ""),
      notes: String(formData.get("notes") || ""),
      is_public: formData.get("is_public") === "on",
      is_for_sale: formData.get("is_for_sale") === "on",
      sire_id:
        formData.get("sire_id") === "none"
          ? null
          : String(formData.get("sire_id") || null),
      dam_id:
        formData.get("dam_id") === "none"
          ? null
          : String(formData.get("dam_id") || null),
    });

    revalidatePath("/dogs");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-white">
      {/* LEFT SIDE - LIST */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-amber-400">Dogs</h1>

        <div className="space-y-3">
          {dogs?.map((dog) => (
            <Link
              key={dog.id}
              href={`/dogs/${dog.id}`}
              className="block p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition"
            >
              <div className="text-xl font-bold text-amber-400 hover:underline">
                {dog.name}
              </div>
              <div className="text-sm text-zinc-400">
                {dog.breed} • {dog.sex}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <form
        action={addDog}
        className="space-y-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/40"
      >
        <h2 className="text-xl font-semibold text-white">Add New Dog</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <input
              name="name"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Breed</label>
            <input
              name="breed"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Sex</label>
            <select
              name="sex"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Birth Date</label>
            <input
              type="date"
              name="birth_date"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Microchip ID</label>
            <input
              name="microchip_id"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Passport Number</label>
            <input
              name="passport_number"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm text-zinc-400">Color Markings</label>
            <input
              name="color_markings"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>

          {/* SIRE */}
          <div>
            <label className="text-sm text-zinc-400">Sire (Father)</label>
            <select
              name="sire_id"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            >
              <option value="none">None</option>
              {maleDogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* DAM */}
          <div>
            <label className="text-sm text-zinc-400">Dam (Mother)</label>
            <select
              name="dam_id"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            >
              <option value="none">None</option>
              {femaleDogs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Notes</label>
            <textarea
              name="notes"
              className="w-full mt-1 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </div>
        </div>

        <div className="flex gap-6 pt-2">
          <label className="text-sm text-zinc-400 flex items-center gap-2">
            <input type="checkbox" name="is_public" />
            Public
          </label>

          <label className="text-sm text-zinc-400 flex items-center gap-2">
            <input type="checkbox" name="is_for_sale" />
            For Sale
          </label>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg transition"
        >
          Add Dog
        </button>
      </form>
    </div>
  );
}

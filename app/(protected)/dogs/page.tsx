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
    return <div className="p-6 text-red-500">Not authenticated</div>;
  }

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const males = dogs?.filter((d) => d.sex === "Male") ?? [];
  const females = dogs?.filter((d) => d.sex === "Female") ?? [];

  async function addDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const sire_id = formData.get("sire_id");
    const dam_id = formData.get("dam_id");

    await supabase.from("dogs").insert({
      user_id: user.id,
      name: formData.get("name"),
      breed: formData.get("breed"),
      sex: formData.get("sex"),
      birth_date: formData.get("birth_date"),
      microchip_id: formData.get("microchip_id"),
      passport_number: formData.get("passport_number"),
      color_markings: formData.get("color_markings"),
      is_public: formData.get("is_public") === "on",
      is_for_sale: formData.get("is_for_sale") === "on",
      notes: formData.get("notes"),
      sire_id: sire_id === "none" ? null : sire_id,
      dam_id: dam_id === "none" ? null : dam_id,
    });

    revalidatePath("/dogs");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dogs</h1>

        <div className="space-y-3">
          {dogs?.map((dog) => (
            <Link
              key={dog.id}
              href={`/dogs/${dog.id}`}
              className="block border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 hover:bg-zinc-800/60 transition"
            >
              <div className="font-semibold text-white">{dog.name}</div>
              <div className="text-sm text-zinc-400">
                {dog.breed} • {dog.sex}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Add New Dog</h2>

        <form action={addDog} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-300">Name</label>
            <input
              name="name"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Breed</label>
            <input
              name="breed"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Sex</label>
            <select
              name="sex"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Birth Date</label>
            <input
              type="date"
              name="birth_date"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Microchip ID</label>
            <input
              name="microchip_id"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Passport Number</label>
            <input
              name="passport_number"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Color Markings</label>
            <input
              name="color_markings"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Sire (Father)</label>
            <select
              name="sire_id"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            >
              <option value="none">None</option>
              {males.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Dam (Mother)</label>
            <select
              name="dam_id"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            >
              <option value="none">None</option>
              {females.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 text-sm text-zinc-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_public" />
              Public
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_for_sale" />
              For Sale
            </label>
          </div>

          <div>
            <label className="text-sm text-zinc-300">Notes</label>
            <textarea
              name="notes"
              className="w-full p-2 rounded bg-zinc-900 border border-zinc-800"
            />
          </div>

          <button className="w-full bg-white text-black py-2 rounded hover:bg-zinc-200 transition">
            Add New Dog
          </button>
        </form>
      </div>
    </div>
  );
}

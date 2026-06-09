import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: LIST */}
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Your Dogs</h1>

        <div className="space-y-3">
          {dogs?.map((dog) => (
            <Link
              key={dog.id}
              href={`/dogs/${dog.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:border-zinc-700 hover:bg-zinc-900 transition cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xl font-bold text-amber-500 hover:underline">
                  {dog.name}
                </span>

                <span className="text-sm text-zinc-400">
                  {dog.breed || "Unknown breed"}
                </span>

                <div className="text-xs text-zinc-500">
                  {dog.sex} • {dog.microchip_id || "No chip"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT: FORM PLACEHOLDER (kept minimal but safe) */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-bold mb-4 text-white">Add New Dog</h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Name"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />
            <input
              name="breed"
              placeholder="Breed"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />

            <select
              name="sex"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            >
              <option value="">Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <input
              name="microchip_id"
              placeholder="Microchip ID"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />

            <input
              name="passport_number"
              placeholder="Passport Number"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />

            <input
              name="color_markings"
              placeholder="Color markings"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />

            <input
              name="birth_date"
              type="date"
              className="p-2 rounded bg-zinc-950 border border-zinc-800"
            />

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="is_public" />
              Public
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="is_for_sale" />
              For Sale
            </label>

            <textarea
              name="notes"
              placeholder="Notes"
              className="md:col-span-2 p-2 rounded bg-zinc-950 border border-zinc-800"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

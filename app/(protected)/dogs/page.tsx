import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  async function addDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { error } = await supabase.from("dogs").insert({
      user_id: user.id,
      name: String(formData.get("name") || ""),
      breed: String(formData.get("breed") || ""),
      sex: String(formData.get("sex") || ""),
      microchip_id: String(formData.get("microchip_id") || ""),
      birth_date: String(formData.get("birth_date") || ""),
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dogs");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dogs</h1>
        <p className="text-zinc-400 mt-1">
          Manage your kennel dogs and profiles
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Add New Dog</h2>

        <form action={addDog} className="grid gap-4 md:grid-cols-2">
          <input
            name="name"
            placeholder="Dog Name"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />

          <input
            name="breed"
            placeholder="Breed"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />

          <select
            name="sex"
            required
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            name="microchip_id"
            placeholder="Microchip ID"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />

          <input
            type="date"
            name="birth_date"
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
          />

          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-4 py-3 font-medium text-black transition hover:bg-amber-400"
          >
            Add New Dog
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <div className="border-b border-zinc-800 p-4">
          <h2 className="font-semibold">Kennel Dogs</h2>
        </div>

        {error ? (
          <div className="p-6 text-red-400">{error.message}</div>
        ) : dogs && dogs.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            {dogs.map((dog) => (
              <Link
                key={dog.id}
                href={`/dogs/${dog.id}`}
                className="flex items-center justify-between p-4 transition hover:bg-zinc-800/40"
              >
                <div>
                  <p className="font-medium text-white">{dog.name}</p>
                  <p className="text-sm text-zinc-400">
                    {dog.breed || "Unknown Breed"}
                  </p>
                </div>

                <div className="text-right text-sm text-zinc-400">
                  <p>{dog.sex || "-"}</p>
                  <p>{dog.microchip_id || "-"}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-6 text-zinc-500">
            No dogs found in your kennel.
          </div>
        )}
      </div>
    </div>
  );
}

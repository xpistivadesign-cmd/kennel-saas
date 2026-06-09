import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .order("name");

  async function addDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    await supabase.from("dogs").insert({
      name: formData.get("name"),
      breed: formData.get("breed"),
      gender: formData.get("gender"),
      chip_number: formData.get("chip_number"),
      birth_date: formData.get("birth_date"),
    });

    revalidatePath("/dogs");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dogs</h1>

      <form action={addDog} className="space-y-2 border p-4 rounded">
        <input
          name="name"
          placeholder="Name"
          className="border p-2 w-full"
          required
        />

        <input
          name="breed"
          placeholder="Breed"
          className="border p-2 w-full"
        />

        <input
          name="gender"
          placeholder="Gender"
          className="border p-2 w-full"
        />

        <input
          name="chip_number"
          placeholder="Chip Number"
          className="border p-2 w-full"
        />

        <input
          name="birth_date"
          type="date"
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add New Dog
        </button>
      </form>

      <div className="space-y-2">
        {dogs?.map((d) => (
          <Link
            key={d.id}
            href={`/dogs/${d.id}`}
            className="block border p-3 rounded hover:bg-white hover:text-black transition"
          >
            {d.name} - {d.breed}
          </Link>
        ))}
      </div>
    </div>
  );
}

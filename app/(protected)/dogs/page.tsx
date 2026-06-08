import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  async function createDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const name = formData.get("name") as string;
    const breed = formData.get("breed") as string;
    const sex = formData.get("sex") as string;
    const chip_number = formData.get("chip_number") as string;
    const birth_date = formData.get("birth_date") as string;

    await supabase.from("dogs").insert({
      name,
      breed,
      sex,
      chip_number,
      birth_date,
    });

    revalidatePath("/protected/dogs");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dogs Management</h1>

      <form action={createDog} className="border p-4 rounded space-y-2">
        <input name="name" placeholder="Name" className="border p-2 w-full" />
        <input name="breed" placeholder="Breed" className="border p-2 w-full" />
        <select name="sex" className="border p-2 w-full">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input name="chip_number" placeholder="Chip" className="border p-2 w-full" />
        <input name="birth_date" type="date" className="border p-2 w-full" />
        <button className="bg-black text-white px-4 py-2 rounded">
          Add New Dog
        </button>
      </form>

      <div className="space-y-2">
        {dogs?.map((d) => (
          <Link
            key={d.id}
            href={`/protected/dogs/${d.id}`}
            className="border p-3 rounded flex justify-between hover:bg-gray-50"
          >
            <div>
              <div className="font-bold">{d.name}</div>
              <div className="text-sm text-gray-500">
                {d.breed} | {d.sex}
              </div>
            </div>
            <div className="text-sm text-gray-400">{d.chip_number}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

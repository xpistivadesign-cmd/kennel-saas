import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function LittersPage() {
  const supabase = await createClient();

  const { data: litters } = await supabase.from("litters").select("*");

  async function createLitter(formData: FormData) {
    "use server";

    const supabase = await createClient();

    await supabase.from("litters").insert({
      mating_id: formData.get("mating_id"),
      birth_date: formData.get("birth_date"),
      male_count: formData.get("male_count"),
      female_count: formData.get("female_count"),
      status: formData.get("status"),
      notes: formData.get("notes"),
    });

    revalidatePath("/protected/litters");
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Litters</h1>

      <form action={createLitter} className="space-y-2 border p-4 rounded">
        <input name="mating_id" placeholder="Mating ID" className="border p-2 w-full" />
        <input name="birth_date" type="date" className="border p-2 w-full" />
        <input name="male_count" placeholder="Male count" className="border p-2 w-full" />
        <input name="female_count" placeholder="Female count" className="border p-2 w-full" />
        <input name="status" placeholder="Status" className="border p-2 w-full" />
        <input name="notes" placeholder="Notes" className="border p-2 w-full" />

        <button className="bg-black text-white px-4 py-2">
          Create New Litter
        </button>
      </form>

      <div className="space-y-2">
        {litters?.map((l) => (
          <div key={l.id} className="border p-3 flex justify-between">
            <div>
              <div>{l.status}</div>
              <div className="text-sm text-gray-500">{l.birth_date}</div>
            </div>

            <Link
              className="text-sm underline"
              href={`/protected/litters/${l.id}/report`}
            >
              Open PDF Report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function LittersPage() {
  const supabase = await createClient();

  const { data: litters } = await supabase
    .from("litters")
    .select("*")
    .order("created_at", { ascending: false });

  async function createLitter(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const mating_id = formData.get("mating_id") as string;
    const birth_date = formData.get("birth_date") as string;
    const male_count = Number(formData.get("male_count"));
    const female_count = Number(formData.get("female_count"));
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;

    await supabase.from("litters").insert({
      mating_id,
      birth_date,
      male_count,
      female_count,
      status,
      notes,
    });

    revalidatePath("/protected/litters");
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Litter Pipeline</h1>

      <form action={createLitter} className="border p-4 rounded space-y-2">
        <input name="mating_id" placeholder="Mating ID" className="border p-2 w-full" />
        <input name="birth_date" type="date" className="border p-2 w-full" />
        <input name="male_count" type="number" placeholder="Male count" className="border p-2 w-full" />
        <input name="female_count" type="number" placeholder="Female count" className="border p-2 w-full" />
        <input name="status" placeholder="Status" className="border p-2 w-full" />
        <textarea name="notes" placeholder="Notes" className="border p-2 w-full" />
        <button className="bg-black text-white px-4 py-2 rounded">
          Create New Litter
        </button>
      </form>

      <div className="space-y-3">
        {litters?.map((l) => (
          <div key={l.id} className="border p-4 rounded flex justify-between">
            <div>
              <div className="font-bold">{l.status}</div>
              <div className="text-sm text-gray-500">
                Born: {l.birth_date || "-"}
              </div>
              <div className="text-sm">
                M: {l.male_count} | F: {l.female_count}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Link
                href={`/protected/litters/${l.id}/report`}
                className="text-sm underline"
              >
                Open PDF Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

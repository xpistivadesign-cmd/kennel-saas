import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function addMedicalRecord(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));
  const type = String(formData.get("type"));
  const result = String(formData.get("result"));
  const date = String(formData.get("date"));

  const { error } = await supabase.from("medical_records").insert({
    dog_id,
    type,
    result,
    date,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dogs/${dog_id}`);
}

type Dog = {
  id: string;
  name: string | null;
  breed: string | null;
  sire_id: string | null;
  dam_id: string | null;
};

async function getDog(supabase: any, id: string, userId: string) {
  const { data } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dog = await getDog(supabase, params.id, user.id);
  if (!dog) return <div className="text-white p-10">Not found</div>;

  const sire = dog.sire_id ? await getDog(supabase, dog.sire_id, user.id) : null;
  const dam = dog.dam_id ? await getDog(supabase, dog.dam_id, user.id) : null;

  const records = await supabase
    .from("medical_records")
    .select("*")
    .eq("dog_id", dog.id)
    .order("date", { ascending: false });

  const Card = ({ d }: any) => (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      {d?.name || "Unknown"}
    </div>
  );

  return (
    <div className="space-y-8 text-white p-8">

      <div className="text-3xl font-bold">{dog.name}</div>

      {/* PEDIGREE SIMPLE */}
      <div className="grid grid-cols-3 gap-4">
        <Card d={dog} />
        <div className="space-y-2">
          <Card d={sire} />
          <Card d={dam} />
        </div>
      </div>

      {/* MEDICAL */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <h2 className="text-xl font-bold">Medical Records</h2>

        {(records.data || []).map((r: any) => (
          <div key={r.id} className="text-sm border-b border-zinc-800 py-2">
            {r.date} — {r.type} — {r.result}
          </div>
        ))}

        <form action={addMedicalRecord} className="space-y-2">
          <input type="hidden" name="dog_id" value={dog.id} />

          <input name="date" type="date" className="w-full p-2 bg-black rounded" />
          <input name="type" placeholder="Type" className="w-full p-2 bg-black rounded" />
          <input name="result" placeholder="Result" className="w-full p-2 bg-black rounded" />

          <button className="bg-amber-500 text-black px-4 py-2 rounded">
            Add Record
          </button>
        </form>
      </div>

    </div>
  );
}

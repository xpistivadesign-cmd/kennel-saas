import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addPuppy(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const litter_id = String(formData.get("litter_id"));

  await supabase.from("puppies").insert({
    litter_id,
    name: String(formData.get("name")),
    status: String(formData.get("status")),
  });

  revalidatePath("/litters");
}

async function sellPuppy(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const puppy_id = String(formData.get("puppy_id"));
  const price = Number(formData.get("price"));

  await supabase.from("puppies").update({
    status: "sold",
    price,
  }).eq("id", puppy_id);

  await supabase.from("payments").insert({
    amount: price,
    type: "income",
    category: "Puppy Sale",
  });

  revalidatePath("/litters");
}

export default async function Page() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: litters } = await supabase
    .from("litters")
    .select("*, puppies(*)")
    .eq("user_id", user.id);

  return (
    <div className="p-8 text-white space-y-10">

      {(litters || []).map((l: any) => (
        <div key={l.id} className="border p-4 rounded-xl">

          <div className="font-bold">{l.name}</div>

          {(l.puppies || []).map((p: any) => (
            <div key={p.id} className="text-sm">
              {p.name} — {p.status}
            </div>
          ))}

        </div>
      ))}

    </div>
  );
}

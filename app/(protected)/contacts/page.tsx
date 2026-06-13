import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addContact(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  await supabase.from("contacts").insert({
    name: String(formData.get("name")),
    email: String(formData.get("email")),
    phone: String(formData.get("phone")),
    status: "waiting",
  });

  revalidatePath("/contacts");
}

export default async function Page() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="p-8 text-white space-y-6">

      {(contacts || []).map((c: any) => (
        <div key={c.id} className="border p-3 rounded">
          {c.name} — {c.status}
        </div>
      ))}

      <form action={addContact} className="space-y-2">
        <input name="name" className="p-2 bg-black w-full" />
        <input name="email" className="p-2 bg-black w-full" />
        <input name="phone" className="p-2 bg-black w-full" />

        <button className="bg-amber-500 px-4 py-2 text-black">
          Add Contact
        </button>
      </form>

    </div>
  );
}

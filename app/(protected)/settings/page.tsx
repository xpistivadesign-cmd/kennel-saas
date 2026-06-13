import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function saveKennel(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("name"));
  const description = String(formData.get("description"));
  const phone = String(formData.get("phone"));
  const email = String(formData.get("email"));

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const file = formData.get("logo") as File | null;

  let logo_url = null;

  if (file && file.size > 0) {
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("kennel-logos")
      .upload(fileName, file);

    if (!error) {
      const { data: publicUrl } = supabase.storage
        .from("kennel-logos")
        .getPublicUrl(data.path);

      logo_url = publicUrl.publicUrl;
    }
  }

  await supabase.from("kennels").upsert({
    user_id: user.id,
    name,
    description,
    phone,
    email,
    slug,
    logo_url,
  });

  revalidatePath("/settings");
}

export default async function SettingsPage() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: kennel } = await supabase
    .from("kennels")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-8 text-white space-y-6">

      <h1 className="text-3xl font-bold">Kennel Settings</h1>

      <form action={saveKennel} className="space-y-3">

        <input
          name="name"
          defaultValue={kennel?.name || ""}
          placeholder="Kennel Name"
          className="w-full p-2 bg-black rounded"
        />

        <textarea
          name="description"
          defaultValue={kennel?.description || ""}
          placeholder="Description"
          className="w-full p-2 bg-black rounded"
        />

        <input name="phone" defaultValue={kennel?.phone || ""} className="w-full p-2 bg-black rounded" />
        <input name="email" defaultValue={kennel?.email || ""} className="w-full p-2 bg-black rounded" />

        <input type="file" name="logo" className="w-full p-2 bg-black rounded" />

        <button className="bg-amber-500 text-black px-4 py-2 rounded">
          Save Kennel
        </button>

      </form>
    </div>
  );
}

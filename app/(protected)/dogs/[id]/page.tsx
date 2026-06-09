import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dog) redirect("/dogs");

  const { data: sire } = dog.sire_id
    ? await supabase.from("dogs").select("name").eq("id", dog.sire_id).single()
    : { data: null };

  const { data: dam } = dog.dam_id
    ? await supabase.from("dogs").select("name").eq("id", dog.dam_id).single()
    : { data: null };

  async function updateDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    await supabase
      .from("dogs")
      .update({
        name: String(formData.get("name")),
        breed: String(formData.get("breed")),
        sex: String(formData.get("sex")),
        microchip_id: String(formData.get("microchip_id")),
        passport_number: String(formData.get("passport_number")),
        pedigree_number: String(formData.get("pedigree_number")),
        reg_number: String(formData.get("reg_number")),
        color_markings: String(formData.get("color_markings")),
        notes: String(formData.get("notes")),
        sire_id:
          formData.get("sire_id") === "none"
            ? null
            : formData.get("sire_id"),
        dam_id:
          formData.get("dam_id") === "none"
            ? null
            : formData.get("dam_id"),
        is_public: formData.get("is_public") === "on",
        is_for_sale: formData.get("is_for_sale") === "on",
      })
      .eq("id", dog.id)
      .eq("user_id", user.id);

    revalidatePath(`/dogs/${dog.id}`);
  }

  async function uploadPhoto(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const file = formData.get("file") as File;

    if (!file) return;

    const filePath = `${dog.id}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("dog-photos")
      .upload(filePath, file);

    if (error) return;

    const { data } = supabase.storage
      .from("dog-photos")
      .getPublicUrl(filePath);

    await supabase
      .from("dogs")
      .update({ image_url: data.publicUrl })
      .eq("id", dog.id);

    revalidatePath(`/dogs/${dog.id}`);
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dog.name}</h1>
          <p className="text-zinc-400">
            Sire: {sire?.name || "-"} | Dam: {dam?.name || "-"}
          </p>
        </div>
      </div>

      <form action={updateDog} className="grid gap-3 md:grid-cols-2">
        <input name="name" defaultValue={dog.name} className="input" />
        <input name="breed" defaultValue={dog.breed} className="input" />
        <input name="sex" defaultValue={dog.sex} className="input" />
        <input name="microchip_id" defaultValue={dog.microchip_id} className="input" />
        <input name="passport_number" defaultValue={dog.passport_number} className="input" />
        <input name="pedigree_number" defaultValue={dog.pedigree_number} className="input" />
        <input name="reg_number" defaultValue={dog.reg_number} className="input" />
        <input name="color_markings" defaultValue={dog.color_markings} className="input" />

        <select name="sire_id" className="input" defaultValue={dog.sire_id || "none"}>
          <option value="none">No Sire</option>
        </select>

        <select name="dam_id" className="input" defaultValue={dog.dam_id || "none"}>
          <option value="none">No Dam</option>
        </select>

        <textarea name="notes" defaultValue={dog.notes} className="input" />

        <button className="bg-amber-500 text-black px-4 py-2 rounded-lg">
          Save Changes
        </button>
      </form>

      <form action={uploadPhoto} className="space-y-2">
        <input type="file" name="file" />
        <button className="bg-white text-black px-3 py-2 rounded">
          Upload Photo
        </button>
      </form>

      {dog.image_url && (
        <img
          src={dog.image_url}
          className="rounded-xl border border-zinc-800 max-w-md"
        />
      )}
    </div>
  );
}

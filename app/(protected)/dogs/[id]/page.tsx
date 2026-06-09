import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dog) {
    return (
      <div className="p-6 text-red-400">
        Dog not found
        <div className="mt-4">
          <Link href="/dogs" className="text-amber-400 underline">
            Back to Dogs
          </Link>
        </div>
      </div>
    );
  }

  const { data: allDogs } = await supabase
    .from("dogs")
    .select("id,name,sex")
    .eq("user_id", user.id);

  const males = allDogs?.filter((d) => d.sex === "Male") || [];
  const females = allDogs?.filter((d) => d.sex === "Female") || [];

  async function updateDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("dogs")
      .update({
        name: String(formData.get("name")),
        breed: String(formData.get("breed")),
        sex: String(formData.get("sex")),
        microchip_id: String(formData.get("microchip_id")),
        passport_number: String(formData.get("passport_number")),
        color_markings: String(formData.get("color_markings")),
        notes: String(formData.get("notes")),
        is_public: formData.get("is_public") === "on",
        is_for_sale: formData.get("is_for_sale") === "on",
        sire_id:
          formData.get("sire_id") === "none"
            ? null
            : String(formData.get("sire_id")),
        dam_id:
          formData.get("dam_id") === "none"
            ? null
            : String(formData.get("dam_id")),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    revalidatePath(`/dogs/${id}`);
  }

  async function uploadImage(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const file = formData.get("file") as File;

    if (!file) return;

    const filePath = `${user.id}/${id}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("dog-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) return;

    const { data } = supabase.storage
      .from("dog-photos")
      .getPublicUrl(filePath);

    await supabase
      .from("dogs")
      .update({
        image_url: data.publicUrl,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    revalidatePath(`/dogs/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{dog.name}</h1>
          <p className="text-zinc-400">{dog.breed}</p>
        </div>

        <Link href="/dogs" className="text-zinc-400 underline">
          Back to Dogs
        </Link>
      </div>

      {/* IMAGE */}
      <div className="space-y-3">
        <div className="w-full h-64 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center overflow-hidden">
          {dog.image_url ? (
            <img
              src={dog.image_url}
              className="w-full h-full object-cover"
              alt="dog"
            />
          ) : (
            <div className="text-zinc-500">No Image</div>
          )}
        </div>

        <form action={uploadImage} className="flex gap-3">
          <input
            type="file"
            name="file"
            className="text-sm text-zinc-400"
          />
          <button className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700">
            Upload Image
          </button>
        </form>
      </div>

      {/* EDIT FORM */}
      <form
        action={updateDog}
        className="space-y-4 p-6 rounded-xl border border-zinc-800 bg-zinc-900/40"
      >
        <h2 className="text-xl font-semibold text-white">Edit Profile</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="name"
            defaultValue={dog.name}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          />

          <input
            name="breed"
            defaultValue={dog.breed}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          />

          <select
            name="sex"
            defaultValue={dog.sex}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            name="microchip_id"
            defaultValue={dog.microchip_id}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          />

          <input
            name="passport_number"
            defaultValue={dog.passport_number}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          />

          <input
            name="color_markings"
            defaultValue={dog.color_markings}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          />

          <select
            name="sire_id"
            defaultValue={dog.sire_id || "none"}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          >
            <option value="none">None</option>
            {males.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            name="dam_id"
            defaultValue={dog.dam_id || "none"}
            className="p-2 bg-zinc-950 border border-zinc-800 rounded"
          >
            <option value="none">None</option>
            {females.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          name="notes"
          defaultValue={dog.notes}
          className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded"
        />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              name="is_public"
              defaultChecked={dog.is_public}
            />
            Public
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              name="is_for_sale"
              defaultChecked={dog.is_for_sale}
            />
            For Sale
          </label>
        </div>

        <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 rounded-lg">
          Save Changes
        </button>
      </form>
    </div>
  );
}

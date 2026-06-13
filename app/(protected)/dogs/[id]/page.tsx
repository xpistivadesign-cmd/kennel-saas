import { createServerSupabase } from "@/lib/supabase/server";
import { redirect, revalidatePath } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function updateDog(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const id = String(formData.get("id"));
  const user_id = String(formData.get("user_id"));

  await supabase
    .from("dogs")
    .update({
      name: formData.get("name"),
      breed: formData.get("breed"),
      color_markings: formData.get("color_markings"),
      birth_date: formData.get("birth_date"),
      microchip_id: formData.get("microchip_id"),
      passport_number: formData.get("passport_number"),
      pedigree_number: formData.get("pedigree_number"),
      is_public: formData.get("is_public") === "true",
      is_for_sale: formData.get("is_for_sale") === "true",
    })
    .eq("id", id)
    .eq("user_id", user_id);

  revalidatePath(`/dogs/${id}`);
}

async function addMedical(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));

  await supabase.from("medical_records").insert({
    dog_id,
    date: formData.get("date"),
    type: formData.get("type"),
    notes: formData.get("notes"),
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function addShow(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));

  await supabase.from("dog_shows").insert({
    dog_id,
    show_name: formData.get("show_name"),
    date: formData.get("date"),
    location: formData.get("location"),
    judge: formData.get("judge"),
    class: formData.get("class"),
    placement: formData.get("placement"),
    notes: formData.get("notes"),
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function addHeat(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));

  await supabase.from("heats").insert({
    dog_id,
    date: formData.get("date"),
    progesterone: formData.get("progesterone"),
    notes: formData.get("notes"),
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function addMating(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));

  await supabase.from("matings").insert({
    female_id: dog_id,
    male_name: formData.get("male_name"),
    male_id: formData.get("male_id") || null,
    date: formData.get("date"),
    notes: formData.get("notes"),
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function addWhelping(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));

  await supabase.from("litters").insert({
    dam_id: dog_id,
    sire_id: formData.get("sire_id"),
    birth_date: formData.get("birth_date"),
    live_puppies: formData.get("live_puppies"),
    dead_puppies: formData.get("dead_puppies"),
    status: "Planned",
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function uploadImage(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));
  const file = formData.get("file") as File;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filePath = `${dog_id}-${Date.now()}.jpg`;

  await supabase.storage
    .from("dog-photos")
    .upload(filePath, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  const { data } = supabase.storage
    .from("dog-photos")
    .getPublicUrl(filePath);

  await supabase
    .from("dogs")
    .update({ image_url: data.publicUrl })
    .eq("id", dog_id);

  revalidatePath(`/dogs/${dog_id}`);
}

export default async function DogProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return <div className="p-10 text-red-400">Not found</div>;
  }

  const { data: medical } = await supabase
    .from("medical_records")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">
            {dog.name}
          </h1>
          <p className="text-zinc-400">{dog.breed}</p>
        </div>

        <form action={uploadImage} className="space-y-2">
          <input type="hidden" name="dog_id" value={dog.id} />
          <input
            type="file"
            name="file"
            accept="image/*"
            className="text-sm"
          />
          <button className="px-4 py-2 bg-amber-500 text-black rounded">
            Upload Image
          </button>
        </form>
      </div>

      {/* EDIT FORM */}
      <form action={updateDog} className="grid md:grid-cols-3 gap-3 bg-zinc-900 p-4 rounded-xl">
        <input type="hidden" name="id" value={dog.id} />
        <input type="hidden" name="user_id" value={user.id} />

        <input name="name" defaultValue={dog.name} className="p-2 bg-black border border-zinc-700" />
        <input name="breed" defaultValue={dog.breed} className="p-2 bg-black border border-zinc-700" />
        <input name="color_markings" defaultValue={dog.color_markings} className="p-2 bg-black border border-zinc-700" />
        <input name="birth_date" defaultValue={dog.birth_date} className="p-2 bg-black border border-zinc-700" />
        <input name="microchip_id" defaultValue={dog.microchip_id} className="p-2 bg-black border border-zinc-700" />
        <input name="passport_number" defaultValue={dog.passport_number} className="p-2 bg-black border border-zinc-700" />
        <input name="pedigree_number" defaultValue={dog.pedigree_number} className="p-2 bg-black border border-zinc-700" />

        <select name="is_public" defaultValue={String(dog.is_public)} className="p-2 bg-black border border-zinc-700">
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>

        <select name="is_for_sale" defaultValue={String(dog.is_for_sale)} className="p-2 bg-black border border-zinc-700">
          <option value="true">For Sale</option>
          <option value="false">Not for Sale</option>
        </select>

        <button className="bg-green-500 text-black p-2 rounded col-span-full">
          Save Profile
        </button>
      </form>

      {/* BREEDING (FEMALE ONLY) */}
      {isFemale && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-6">

          <h2 className="text-xl font-bold text-amber-400">Breeding Logs</h2>

          {/* HEAT */}
          <form action={addHeat} className="grid md:grid-cols-4 gap-2">
            <input type="hidden" name="dog_id" value={dog.id} />
            <input name="date" type="date" className="p-2 bg-black border border-zinc-700" />
            <input name="progesterone" placeholder="ng/ml" className="p-2 bg-black border border-zinc-700" />
            <input name="notes" placeholder="notes" className="p-2 bg-black border border-zinc-700" />
            <button className="bg-amber-500 text-black p-2 rounded">Add Heat</button>
          </form>

          {heats?.map((h: any) => (
            <div key={h.id} className="text-sm text-zinc-300">
              {h.date} — {h.progesterone} ng/ml
              {h.progesterone >= 5 && h.progesterone <= 10 && (
                <span className="text-green-400 font-bold ml-2">
                  OPTIMAL BREEDING WINDOW
                </span>
              )}
            </div>
          ))}

          {/* MATING */}
          <form action={addMating} className="grid md:grid-cols-3 gap-2">
            <input type="hidden" name="dog_id" value={dog.id} />
            <input name="male_name" placeholder="Male name" className="p-2 bg-black border border-zinc-700" />
            <input name="date" type="date" className="p-2 bg-black border border-zinc-700" />
            <input name="notes" placeholder="notes" className="p-2 bg-black border border-zinc-700" />
            <button className="bg-blue-500 text-black p-2 rounded col-span-full">Add Mating</button>
          </form>

          {/* WHELPING */}
          <form action={addWhelping} className="grid md:grid-cols-4 gap-2">
            <input type="hidden" name="dog_id" value={dog.id} />
            <input name="sire_id" placeholder="Sire ID" className="p-2 bg-black border border-zinc-700" />
            <input name="birth_date" type="date" className="p-2 bg-black border border-zinc-700" />
            <input name="live_puppies" placeholder="Live" className="p-2 bg-black border border-zinc-700" />
            <input name="dead_puppies" placeholder="Dead" className="p-2 bg-black border border-zinc-700" />
            <button className="bg-green-500 text-black p-2 rounded col-span-full">Add Litter</button>
          </form>

        </div>
      )}

      {/* MEDICAL */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
        <h2 className="text-amber-400 font-bold">Medical Records</h2>

        <form action={addMedical} className="grid md:grid-cols-4 gap-2">
          <input type="hidden" name="dog_id" value={dog.id} />
          <input name="date" type="date" className="p-2 bg-black border border-zinc-700" />
          <input name="type" placeholder="type" className="p-2 bg-black border border-zinc-700" />
          <input name="notes" placeholder="notes" className="p-2 bg-black border border-zinc-700" />
          <button className="bg-amber-500 text-black p-2 rounded">Add</button>
        </form>

        {medical?.map((m: any) => (
          <div key={m.id} className="text-sm text-zinc-300">
            {m.date} — {m.type} — {m.notes}
          </div>
        ))}
      </div>

      {/* SHOWS */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
        <h2 className="text-amber-400 font-bold">Shows & Journal</h2>

        <form action={addShow} className="grid md:grid-cols-4 gap-2">
          <input type="hidden" name="dog_id" value={dog.id} />
          <input name="show_name" placeholder="show" className="p-2 bg-black border border-zinc-700" />
          <input name="date" type="date" className="p-2 bg-black border border-zinc-700" />
          <input name="location" placeholder="location" className="p-2 bg-black border border-zinc-700" />
          <button className="bg-amber-500 text-black p-2 rounded">Add</button>
        </form>

        {shows?.map((s: any) => (
          <div key={s.id} className="text-sm text-zinc-300">
            {s.date} — {s.show_name} — {s.placement}
          </div>
        ))}
      </div>

    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // FIX: A revalidatePath a next/cache-ből jön!

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
      birth_date: formData.get("birth_date") || null,
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

  // FIX: Az adatbázis sémádban start_date van, nem sima date!
  await supabase.from("heats").insert({
    dog_id,
    start_date: formData.get("date"),
    progesterone: parseFloat(String(formData.get("progesterone"))) || 0,
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
    sire_id: formData.get("sire_id") || null,
    birth_date: formData.get("birth_date"),
    live_puppies: parseInt(String(formData.get("live_puppies"))) || 0,
    dead_puppies: parseInt(String(formData.get("dead_puppies"))) || 0,
    status: "Planned",
  });

  revalidatePath(`/dogs/${dog_id}`);
}

async function uploadImage(formData: FormData) {
  "use server";

  const supabase = createServerSupabase();

  const dog_id = String(formData.get("dog_id"));
  const file = formData.get("file") as File;

  if (!file || file.size === 0) return;

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
    return <div className="p-10 text-red-400 bg-black min-h-screen">Dog record not found.</div>;
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
    .order("start_date", { ascending: false }); // FIX: rendezés start_date szerint

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      {/* PROFILE HEADER WITH

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
  const dog

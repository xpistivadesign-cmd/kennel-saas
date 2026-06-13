import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DogProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !dog) {
    return (
      <div className="p-10 text-red-400">
        Dog not found
      </div>
    );
  }

  const { data: allDogs } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .eq("user_id", user.id);

  async function uploadAction(formData: FormData) {
    "use server";
  }

  async function saveAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") || "");
    const microchip_id = String(formData.get("microchip_id") || "");
    const passport_number = String(formData.get("passport_number") || "");
    const color_markings = String(formData.get("color_markings") || "");
    const sire_id = String(formData.get("sire_id") || "");
    const dam_id = String(formData.get("dam_id") || "");

    const supabase = createServerSupabase();

    await supabase
      .from("dogs")
      .update({
        name,
        microchip_id,
        passport_number,
        color_markings,
        sire_id: sire_id || null,
        dam_id: dam_id || null,
      })
      .eq("id", params.id)
      .eq("user_id", user.id);
  }

  return (
    <DogProfileClient
      dog={dog}
      dogs={allDogs ?? []}
      uploadAction={uploadAction}
      saveAction={saveAction}
    />
  );
}

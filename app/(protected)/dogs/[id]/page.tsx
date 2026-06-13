import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DogProfileClient from "./profile-client";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DogProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !dog) {
    return (
      <div className="p-10 text-white">
        <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
          Dog not found
        </div>
      </div>
    );
  }

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id,name,sex")
    .eq("user_id", user.id)
    .neq("id", id)
    .order("name");

  async function saveDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("dogs")
      .update({
        name: formData.get("name"),
        breed: formData.get("breed"),
        microchip_id: formData.get("microchip_id"),
        passport_number: formData.get("passport_number"),
        color_markings: formData.get("color_markings"),
        notes: formData.get("notes"),
        status: formData.get("status"),
        sire_id: formData.get("sire_id") || null,
        dam_id: formData.get("dam_id") || null,
        is_public: formData.get("is_public") === "on",
        is_for_sale: formData.get("is_for_sale") === "on",
      })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  async function uploadImage(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    try {
      const file = formData.get("image") as File;

      if (!file || file.size === 0) {
        throw new Error("No file selected");
      }

      const fileName = `${user.id}/${id}-${Date.now()}.jpg`;

      const { error: storageError } =
        await supabase.storage
          .from("dog-photos")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: "image/jpeg",
          });

      if (storageError) {
        console.error(storageError);
        throw storageError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("dog-photos")
          .getPublicUrl(fileName);

      const publicUrl =
        publicUrlData.publicUrl;

      const { error: updateError } =
        await supabase
          .from("dogs")
          .update({
            image_url: publicUrl,
          })
          .eq("id", id)
          .eq("user_id", user.id);

      if (updateError) {
        console.error(updateError);
        throw updateError;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-8 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            {dog.name}
          </h1>

          <p className="text-zinc-400">
            {dog.breed || "Dog Profile"}
          </p>
        </div>

        <Link
          href="/dogs"
          className="rounded-xl border border-zinc-800 px-5 py-3 hover:bg-zinc-900"
        >
          Back to Dogs
        </Link>
      </div>

      <DogProfileClient
        dog={dog}
        dogs={dogs || []}
        uploadAction={uploadImage}
        saveAction={saveDog}
      />
    </div>
  );
}

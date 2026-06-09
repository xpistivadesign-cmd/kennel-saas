import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ImageUpload from "./upload-client";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="p-6 text-red-400">
        Invalid dog ID
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!dog) {
    return (
      <div className="p-6 space-y-4 text-red-400">
        Dog not found
        <Link href="/dogs" className="block text-amber-400 underline">
          Back
        </Link>
      </div>
    );
  }

  async function updateImageUrl(url: string) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const userId = user.id;

    await supabase
      .from("dogs")
      .update({ image_url: url })
      .eq("id", id)
      .eq("user_id", userId);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">
            {dog.name}
          </h1>
          <p className="text-zinc-400">{dog.breed}</p>
        </div>

        <Link href="/dogs" className="text-sm text-zinc-400 underline">
          Back to Dogs
        </Link>
      </div>

      {/* IMAGE SECTION */}
      <div className="space-y-4">
        <div className="w-full max-w-md aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
          {dog.image_url ? (
            <img
              src={dog.image_url}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-zinc-500">No image</div>
          )}
        </div>

        <ImageUpload
          userId={userId}
          dogId={id}
          onUploaded={updateImageUrl}
        />
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          Microchip: {dog.microchip_id || "-"}
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          Passport: {dog.passport_number || "-"}
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          Sex: {dog.sex || "-"}
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          Status: {dog.status || "-"}
        </div>
      </div>
    </div>
  );
}

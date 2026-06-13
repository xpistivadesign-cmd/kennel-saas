import { createServerSupabase } from "@/lib/supabase/server";
import { redirect, revalidatePath } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params;

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
    return (
      <div className="p-10 text-red-400">
        Dog not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 space-y-6">

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-amber-400">
          {dog.name}
        </h1>
        <p className="text-zinc-400">{dog.breed}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-500 text-sm">Sex</div>
          <div>{dog.sex}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-500 text-sm">Microchip</div>
          <div>{dog.microchip_id || "Unknown"}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-500 text-sm">Passport</div>
          <div>{dog.passport_number || "Unknown"}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-500 text-sm">Color</div>
          <div>{dog.color_markings || "Unknown"}</div>
        </div>

      </div>

      {dog.image_url ? (
        <img
          src={dog.image_url}
          className="w-full max-w-md rounded-xl border border-zinc-800"
        />
      ) : (
        <div className="w-full max-w-md h-64 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500">
          No Image
        </div>
      )}

    </div>
  );
}

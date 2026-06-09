import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import DogClient from "./ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DogProfilePage({ params }: PageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return (
      <div className="p-6 text-red-400">
        Invalid dog ID
        <Link href="/dogs" className="block mt-4 underline text-amber-400">
          Back
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !dog) {
    return (
      <div className="p-6 text-red-400">
        Dog not found
        <Link href="/dogs" className="block mt-4 underline text-amber-400">
          Back
        </Link>
      </div>
    );
  }

  const { data: allDogs } = await supabase
    .from("dogs")
    .select("id, name, sex");

  const sire = allDogs?.find((d) => d.id === dog.sire_id)?.name;
  const dam = allDogs?.find((d) => d.id === dog.dam_id)?.name;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">
            {dog.name}
          </h1>
          <p className="text-zinc-400">{dog.breed}</p>
        </div>

        <Link href="/dogs" className="text-sm underline text-zinc-400">
          Back to Dogs
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Microchip: {dog.microchip_id || "-"}
        </div>

        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Sex: {dog.sex || "-"}
        </div>

        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Passport: {dog.passport_number || "-"}
        </div>

        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Status: {dog.status || "-"}
        </div>

        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Sire: {sire || "-"}
        </div>

        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
          Dam: {dam || "-"}
        </div>
      </div>

      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40 space-y-4">
        <div className="text-sm text-zinc-400">Photo</div>

        <DogClient dogId={id} currentImage={dog.image_url} />
      </div>

      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
        Notes: {dog.notes || "-"}
      </div>
    </div>
  );
}

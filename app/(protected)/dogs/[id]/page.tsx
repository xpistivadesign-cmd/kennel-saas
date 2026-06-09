import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import DogClient from "./ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DogProfilePage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dogId = params?.id;

  if (!dogId || typeof dogId !== "string") {
    return (
      <div className="p-6 text-red-400">
        Invalid dog ID
        <div className="mt-4">
          <Link href="/dogs" className="underline text-amber-400">
            Back
          </Link>
        </div>
      </div>
    );
  }

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  if (error || !dog) {
    return (
      <div className="p-6 text-red-400">
        Dog not found
        <div className="mt-4">
          <Link href="/dogs" className="underline text-amber-400">
            Back
          </Link>
        </div>
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

        <Link href="/dogs" className="text-sm text-zinc-400 underline">
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

      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
        <div className="mb-3 text-sm text-zinc-400">Photo</div>

        {dog.image_url ? (
          <Image
            src={dog.image_url}
            alt="dog"
            width={600}
            height={400}
            className="rounded-xl object-cover"
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-zinc-600 border border-zinc-800 rounded-xl">
            No image
          </div>
        )}

        <DogClient dogId={dogId} />
      </div>

      <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-900/40">
        Notes: {dog.notes || "-"}
      </div>
    </div>
  );
}

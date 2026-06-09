import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6 text-red-400">Not authenticated</div>;
  }

  const dogId = params.id;

  const { data: dog, error } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Database error: {error.message}
      </div>
    );
  }

  if (!dog) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-red-400">Dog not found</div>
        <Link href="/dogs" className="text-amber-400 underline">
          Back to dogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">
            {dog.name}
          </h1>
          <p className="text-zinc-400">{dog.breed}</p>
        </div>

        <Link href="/dogs" className="text-sm text-zinc-400 underline">
          Back
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="text-zinc-400 text-sm">Microchip</div>
          <div>{dog.microchip_id || "-"}</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="text-zinc-400 text-sm">Sex</div>
          <div>{dog.sex || "-"}</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="text-zinc-400 text-sm">Passport</div>
          <div>{dog.passport_number || "-"}</div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="text-zinc-400 text-sm">Status</div>
          <div>{dog.status || "-"}</div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div className="text-zinc-400 text-sm mb-2">Notes</div>
        <div>{dog.notes || "-"}</div>
      </div>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Dog = {
  id: string;
  name: string | null;
  breed: string | null;
  microchip_id: string | null;
  passport_number: string | null;
  sire_id: string | null;
  dam_id: string | null;
};

type Node = Dog | null;

async function getDog(
  supabase: any,
  id: string,
  userId: string
): Promise<Dog | null> {
  const { data } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  return data || null;
}

export default async function DogProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const root = await getDog(supabase, params.id, user.id);

  if (!root) {
    return (
      <div className="text-white p-10">
        Dog not found
      </div>
    );
  }

  // 2nd generation
  const sire = root.sire_id
    ? await getDog(supabase, root.sire_id, user.id)
    : null;

  const dam = root.dam_id
    ? await getDog(supabase, root.dam_id, user.id)
    : null;

  // 3rd generation (sire side)
  const sire_sire = sire?.sire_id
    ? await getDog(supabase, sire.sire_id, user.id)
    : null;

  const sire_dam = sire?.dam_id
    ? await getDog(supabase, sire.dam_id, user.id)
    : null;

  // 3rd generation (dam side)
  const dam_sire = dam?.sire_id
    ? await getDog(supabase, dam.sire_id, user.id)
    : null;

  const dam_dam = dam?.dam_id
    ? await getDog(supabase, dam.dam_id, user.id)
    : null;

  const Card = ({ dog }: { dog: Dog | null }) => {
    if (!dog) {
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-zinc-500 text-sm">
          Unknown
        </div>
      );
    }

    return (
      <Link
        href={`/dogs/${dog.id}`}
        className="block rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 hover:bg-zinc-800 transition"
      >
        <div className="font-semibold text-white">
          {dog.name || "Unnamed"}
        </div>
        <div className="text-xs text-zinc-400">
          {dog.breed || "Unknown breed"}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          {dog.microchip_id || ""}
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-10 text-white p-8">

      {/* ROOT DOG */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-3xl font-bold">
          {root.name}
        </h1>
        <p className="text-zinc-400">
          {root.breed || "Unknown breed"}
        </p>
      </div>

      {/* PEDIGREE */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-3 gap-6">

          {/* GENERATION 1 */}
          <div className="flex items-center">
            <Card dog={root} />
          </div>

          {/* GENERATION 2 */}
          <div className="flex flex-col gap-6 justify-center">

            <Card dog={sire} />
            <Card dog={dam} />

          </div>

          {/* GENERATION 3 */}
          <div className="grid grid-cols-2 gap-4">

            <Card dog={sire_sire} />
            <Card dog={sire_dam} />
            <Card dog={dam_sire} />
            <Card dog={dam_dam} />

          </div>

        </div>
      </div>

      {/* DETAILS SECTION */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2">
        <div>Microchip: {root.microchip_id || "-"}</div>
        <div>Passport: {root.passport_number || "-"}</div>
      </div>

    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createServerSupabase } from "@/lib/supabase/server";
import DogBreedingSection from "./DogBreedingSection";
import { updateDogProfileAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
    edit?: string;
  }>;
};

async function loadDog(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  id: string,
  userId: string
) {
  const { data } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  return data;
}

async function loadParent(
  supabase: Awaited<ReturnType<typeof createServerSupabase>>,
  parentId?: string | null
) {
  if (!parentId) {
    return null;
  }

  const { data } = await supabase
    .from("dogs")
    .select(
      `
      id,
      name,
      breed,
      registration_number,
      sire_id,
      dam_id
    `
    )
    .eq("id", parentId)
    .single();

  return data;
}

function PedigreeCard({
  dog,
}: {
  dog: any;
}) {
  if (!dog) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-500">
        Unknown
      </div>
    );
  }

  return (
    <Link
      href={`/dogs/${dog.id}`}
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-amber-500 block"
    >
      <div className="font-semibold text-white">
        {dog.name || "Unnamed"}
      </div>

      <div className="text-sm text-zinc-400">
        {dog.breed || "-"}
      </div>

      <div className="text-xs text-zinc-600 mt-2">
        {dog.registration_number || "-"}
      </div>
    </Link>
  );
}

export default async function DogPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;

  const resolvedSearch =
    await searchParams;

  const activeTab =
    resolvedSearch.tab ??
    "overview";

  const edit =
    resolvedSearch.edit ===
    "true";

  const supabase =
    await createServerSupabase();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dog =
    await loadDog(
      supabase,
      id,
      user.id
    );

  if (!dog) {
    notFound();
  }

  const sire =
    await loadParent(
      supabase,
      dog.sire_id
    );

  const dam =
    await loadParent(
      supabase,
      dog.dam_id
    );

  const paternalGrandfather =
    await loadParent(
      supabase,
      sire?.sire_id
    );

  const paternalGrandmother =
    await loadParent(
      supabase,
      sire?.dam_id
    );

  const maternalGrandfather =
    await loadParent(
      supabase,
      dam?.sire_id
    );

  const maternalGrandmother =
    await loadParent(
      supabase,
      dam?.dam_id
    );

  const { data: heats } =
    await supabase
      .from("heats")
      .select("*")
      .eq("dog_id", dog.id)
      .order(
        "start_date",
        {
          ascending:
            false,
        }
      );

  const { data: medical } =
    await supabase
      .from(
        "medical_records"
      )
      .select("*")
      .eq(
        "dog_id",
        dog.id
      );

  const { data: shows } =
    await supabase
      .from(
        "dog_shows"
      )
      .select("*")
      .eq(
        "dog_id",
        dog.id
      );

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div className="flex gap-6 items-center">

            <div className="relative w-32 h-32 rounded-3xl overflow-hidden border border-zinc-800">

              <Image
                fill
                alt={dog.name}
                src={
                  dog.image_url ||
                  "/placeholder-dog.jpg"
                }
                className="object-cover"
              />

            </div>

            <div>

              <h1 className="text-4xl font-bold">
                {dog.name}
              </h1>

              <p className="text-zinc-400">
                {dog.breed}
              </p>

            </div>

          </div>

          <Link
            href={`?tab=overview&edit=true`}
            className="rounded-2xl bg-amber-500 px-5 py-3 text-black font-semibold"
          >
            📝 Edit Profile
          </Link>

        </div>

        <div className="flex flex-wrap gap-3 mb-8">

          <Link
            href="?tab=overview"
            className="bg-zinc-900 rounded-xl px-4 py-2"
          >
            Overview
          </Link>

          <Link
            href="?tab=pedigree"
            className="bg-zinc-900 rounded-xl px-4 py-2"
          >
            Pedigree
          </Link>

          <Link
            href="?tab=medical"
            className="bg-zinc-900 rounded-xl px-4 py-2"
          >
            Medical
          </Link>

          <Link
            href="?tab=shows"
            className="bg-zinc-900 rounded-xl px-4 py-2"
          >
            Shows
          </Link>

          {dog.sex ===
            "Female" && (
            <Link
              href="?tab=breeding"
              className="bg-amber-500 text-black rounded-xl px-4 py-2"
            >
              🐾 Breeding Logs
            </Link>
          )}

        </div>

        {activeTab ===
          "overview" && (
          <div className="rounded-3xl bg-zinc-950 p-8">

            {edit ? (
              <form
                action={
                  updateDogProfileAction
                }
                className="grid gap-4"
              >

                <input
                  type="hidden"
                  name="dogId"
                  value={dog.id}
                />

                <input
                  name="name"
                  defaultValue={
                    dog.name
                  }
                  className="bg-zinc-900 p-3 rounded-xl"
                />

                <input
                  name="breed"
                  defaultValue={
                    dog.breed
                  }
                  className="bg-zinc-900 p-3 rounded-xl"
                />

                <button className="bg-amber-500 rounded-xl p-3 text-black">
                  Save
                </button>

              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">

                <div className="bg-zinc-900 rounded-xl p-4">
                  Sex: {dog.sex}
                </div>

                <div className="bg-zinc-900 rounded-xl p-4">
                  Color: {dog.color}
                </div>

                <div className="bg-zinc-900 rounded-xl p-4">
                  Microchip:
                  {" "}
                  {dog.microchip}
                </div>

                <div className="bg-zinc-900 rounded-xl p-4">
                  Registration:
                  {" "}
                  {
                    dog.registration_number
                  }
                </div>

              </div>
            )}

          </div>
        )}

        {activeTab ===
          "pedigree" && (
          <div className="grid lg:grid-cols-3 gap-4">

            <PedigreeCard
              dog={dog}
            />

            <div className="space-y-4">

              <PedigreeCard
                dog={sire}
              />

              <PedigreeCard
                dog={dam}
              />

            </div>

            <div className="grid gap-4">

              <PedigreeCard
                dog={paternalGrandfather}
              />

              <PedigreeCard
                dog={paternalGrandmother}
              />

              <PedigreeCard
                dog={maternalGrandfather}
              />

              <PedigreeCard
                dog={maternalGrandmother}
              />

            </div>

          </div>
        )}

        {activeTab ===
          "medical" && (
          <div className="space-y-4">

            {medical?.map(
              (
                item: any
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="bg-zinc-900 rounded-xl p-4"
                >
                  {item.type}
                </div>
              )
            )}

          </div>
        )}

        {activeTab ===
          "shows" && (
          <div className="space-y-4">

            {shows?.map(
              (
                item: any
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="bg-zinc-900 rounded-xl p-4"
                >
                  {
                    item.show_name
                  }
                </div>
              )
            )}

          </div>
        )}

        {activeTab ===
          "breeding" &&
          dog.sex ===
            "Female" && (
            <DogBreedingSection
              dogId={
                dog.id
              }
              initialHeats={
                heats ||
                []
              }
            />
          )}

      </div>
    </main>
  );
}

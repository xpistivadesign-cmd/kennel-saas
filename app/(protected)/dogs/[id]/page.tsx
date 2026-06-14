"use server";

import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { updateDogProfileAction } from "./actions";
import DogBreedingSection from "./DogBreedingSection";

export const dynamic = "force-dynamic";

type PageProps = {
params: Promise<{ id: string }>;
searchParams: Promise<{
tab?: string;
edit?: string;
}>;
};

type DogNode = {
id: string;
name: string | null;
breed: string | null;
registration_number: string | null;
sire_id: string | null;
dam_id: string | null;
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
id?: string | null
): Promise<DogNode | null> {
if (!id) {
return null;
}

const { data } = await supabase
.from("dogs")
.select("id,name,breed,registration_number,sire_id,dam_id")
.eq("id", id)
.single();

return data;
}

function PedigreeCard({
dog,
}: {
dog: DogNode | null;
}) {
if (!dog) {
return ( <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-500">
Unknown </div>
);
}

return (
<Link
href={`/dogs/${dog.id}`}
className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-amber-500"
> <div className="font-semibold text-white">
{dog.name || "Unnamed"} </div>

```
  <div className="text-sm text-zinc-400">
    {dog.breed || "Unknown breed"}
  </div>

  <div className="mt-2 text-xs text-zinc-500">
    {dog.registration_number || "No registration"}
  </div>
</Link>
```

);
}

export default async function DogProfilePage({
params,
searchParams,
}: PageProps) {
const { id } = await params;

const resolvedSearch = await searchParams;

const tab = resolvedSearch.tab ?? "overview";
const edit = resolvedSearch.edit === "true";

const supabase = await createServerSupabase();

const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
redirect("/login");
}

const dog = await loadDog(
supabase,
id,
user.id
);

if (!dog) {
notFound();
}

const sire = await loadParent(
supabase,
dog.sire_id
);

const dam = await loadParent(
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
ascending: false,
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
)
.order(
"date",
{
ascending: false,
}
);

const { data: shows } =
await supabase
.from("dog_shows")
.select("*")
.eq(
"dog_id",
dog.id
);

return ( <main className="min-h-screen bg-black px-8 py-10 text-white"> <div className="mx-auto max-w-7xl">

```
    <div className="mb-8 flex items-center justify-between">

      <div className="flex items-center gap-6">

        <div className="relative h-32 w-32 overflow-hidden rounded-3xl border border-zinc-800">

          <Image
            src={
              dog.image_url ||
              "/placeholder-dog.jpg"
            }
            alt={
              dog.name ||
              "Dog"
            }
            fill
            className="object-cover"
          />

        </div>

        <div>
          <h1 className="text-4xl font-bold">
            {dog.name}
          </h1>

          <p className="mt-2 text-zinc-400">
            {dog.breed}
          </p>
        </div>

      </div>

      <Link
        href={`?tab=overview&edit=true`}
        className="rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-black"
      >
        📝 Edit Profile
      </Link>

    </div>

    <div className="mb-8 flex flex-wrap gap-3">

      {[
        ["overview", "📋 Overview"],
        ["pedigree", "🧬 Pedigree"],
        ["medical", "🩺 Medical"],
        ["shows", "🏆 Shows"],
      ]
        .concat(
          dog.sex ===
            "Female"
            ? [
                [
                  "breeding",
                  "🐾 Breeding Logs",
                ],
              ]
            : []
        )
        .map(
          (
            [key, label]
          ) => (
            <Link
              key={key}
              href={`?tab=${key}`}
              className={`rounded-xl px-5 py-3 ${
                tab === key
                  ? "bg-amber-500 text-black"
                  : "bg-zinc-900"
              }`}
            >
              {label}
            </Link>
          )
        )}

    </div>

    {tab ===
      "overview" && (
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">

        {edit ? (
          <form
            action={
              updateDogProfileAction
            }
            className="grid gap-4 md:grid-cols-2"
          >
            <input
              type="hidden"
              name="dogId"
              value={dog.id}
            />

            {[
              "name",
              "breed",
              "color",
              "microchip",
              "registration_number",
              "passport_number",
            ].map(
              (
                field
              ) => (
                <input
                  key={
                    field
                  }
                  name={
                    field
                  }
                  defaultValue={
                    dog[
                      field
                    ]
                  }
                  className="rounded-xl bg-zinc-900 p-3"
                />
              )
            )}

            <button className="rounded-xl bg-amber-500 p-3 text-black">
              Save
            </button>

          </form>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">

            {Object.entries(
              dog
            ).map(
              (
                [
                  k,
                  v,
                ]
              ) => (
                <div
                  key={
                    k
                  }
                  className="rounded-xl bg-zinc-900 p-4"
                >
                  <div className="text-zinc-500">
                    {k}
                  </div>

                  <div>
                    {String(
                      v ??
                        "-"
                    )}
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>
    )}

    {tab ===
      "pedigree" && (
      <div className="grid gap-4 lg:grid-cols-3">

        <PedigreeCard
          dog={
            dog
          }
        />

        <div className="space-y-4">
          <PedigreeCard
            dog={
              sire
            }
          />
          <PedigreeCard
            dog={
              dam
            }
          />
        </div>

        <div className="grid gap-4">
          <PedigreeCard dog={paternalGrandfather} />
          <PedigreeCard dog={paternalGrandmother} />
          <PedigreeCard dog={maternalGrandfather} />
          <PedigreeCard dog={maternalGrandmother} />
        </div>

      </div>
    )}

    {tab ===
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
              className="rounded-2xl bg-zinc-900 p-4"
            >
              {item.type} —{" "}
              {
                item.notes
              }
            </div>
          )
        )}
      </div>
    )}

    {tab ===
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
              className="rounded-2xl bg-zinc-900 p-4"
            >
              {
                item.show_name
              }
            </div>
          )
        )}
      </div>
    )}

    {tab ===
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
```

);
}

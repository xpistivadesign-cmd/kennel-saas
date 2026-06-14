import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import DogBreedingSection from "./DogBreedingSection";

import {
  updateDogProfileAction,
  uploadDogImageAction,
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
  searchParams,
}: any) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const id = resolvedParams.id;
  const activeTab = resolvedSearchParams?.tab || "overview";
  const isEditing = resolvedSearchParams?.edit === "true";

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

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
      <div className="p-10 text-red-400 bg-black min-h-screen font-bold">
        Dog not found
      </div>
    );
  }

  const { data: medical } = await supabase
    .from("medical_records")
    .select("*")
    .eq("dog_id", id);

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", id);

  const { data: heatCycles } = await supabase
    .from("heat_cycles")
    .select("*")
    .eq("dog_id", id);

  const { data: progesterone } = await supabase
    .from("progesterone_tests")
    .select("*")
    .eq("dog_id", id);

  const { data: matings } = await supabase
    .from("matings")
    .select("*")
    .eq("female_id", id);

  const isFemale = dog.sex === "Female";

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{dog.name}</h1>
          <p className="text-zinc-400 text-sm">{dog.breed}</p>
        </div>

        <form action={uploadDogImageAction.bind(null, id)}>
          <input type="file" name="file" />
          <button className="bg-amber-500 text-black px-4 py-2 rounded">
            Upload
          </button>
        </form>
      </div>

      {/* NAV */}
      <div className="flex gap-4 border-b border-zinc-800">
        <Link href={`/dogs/${id}?tab=overview`}>Overview</Link>
        <Link href={`/dogs/${id}?tab=medical`}>Medical</Link>
        <Link href={`/dogs/${id}?tab=shows`}>Shows</Link>
        {isFemale && (
          <Link href={`/dogs/${id}?tab=breeding`}>Breeding</Link>
        )}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="bg-zinc-900 p-4 rounded-xl">
          <p>Breed: {dog.breed}</p>
          <p>Sex: {dog.sex}</p>
          <p>Microchip: {dog.microchip_number}</p>
        </div>
      )}

      {/* MEDICAL */}
      {activeTab === "medical" && (
        <div className="space-y-2">
          {medical?.map((m: any) => (
            <div key={m.id} className="bg-zinc-900 p-2 rounded">
              {m.type} - {m.date}
            </div>
          ))}
        </div>
      )}

      {/* SHOWS */}
      {activeTab === "shows" && (
        <div className="space-y-2">
          {shows?.map((s: any) => (
            <div key={s.id} className="bg-zinc-900 p-2 rounded">
              {s.show_name} - {s.placement}
            </div>
          ))}
        </div>
      )}

      {/* BREEDING */}
      {activeTab === "breeding" && isFemale && (
        <DogBreedingSection
          dogId={id}
          heatCycles={heatCycles || []}
          progesteroneTests={progesterone || []}
          matings={matings || []}
        />
      )}
    </div>
  );
}

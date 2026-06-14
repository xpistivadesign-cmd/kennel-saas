import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import DogBreedingSection from "./DogBreedingSection";

import {
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; edit?: string }>;
};

export default async function DogProfilePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  const activeTab = tab || "overview";

  // ✅ FIX: cookies() is async in Next 16
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

  // ======================
  // DOG
  // ======================
  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return (
      <div className="p-10 text-red-400 bg-black min-h-screen">
        Dog not found
      </div>
    );
  }

  // ======================
  // RELATED DATA
  // ======================
  const { data: medical } = await supabase
    .from("medical_records")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: heatCycles } = await supabase
    .from("heat_cycles")
    .select("*")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  const { data: progesterone } = await supabase
    .from("progesterone_tests")
    .select("*")
    .eq("dog_id", id)
    .order("test_date", { ascending: false });

  const { data: matings } = await supabase
    .from("matings")
    .select("*")
    .eq("female_id", id)
    .order("date", { ascending: false });

  const isFemale = dog.sex === "Female";

  // ======================
  // RENDER
  // ======================
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6">

        <div className="flex items-center gap-4">
          {dog.image_url ? (
            <img
              src={dog.image_url}
              className="w-24 h-24 rounded-xl object-cover border border-zinc-700"
              alt={dog.name}
            />
          ) : (
            <div className="w-24 h-24 bg-zinc-800 rounded-xl flex items-center justify-center text-xs text-zinc-500">
              No Image
            </div>
          )}

          <div>
            <h1 className="text-3xl font-black text-amber-400">
              {dog.name}
            </h1>
            <p className="text-zinc-400 text-sm">{dog.breed}</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div className="flex gap-2 border-b border-zinc-800 text-xs">
        <Link href={`/dogs/${id}?tab=overview`} className="p-2">
          Overview
        </Link>
        <Link href={`/dogs/${id}?tab=medical`} className="p-2">
          Medical
        </Link>
        <Link href={`/dogs/${id}?tab=shows`} className="p-2">
          Shows
        </Link>

        {isFemale && (
          <Link href={`/dogs/${id}?tab=breeding`} className="p-2">
            Breeding
          </Link>
        )}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <div>Passport: {dog.passport_number || "—"}</div>
          <div>Registration: {dog.registration_number || "—"}</div>
        </div>
      )}

      {/* MEDICAL */}
      {activeTab === "medical" && (
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          {medical?.map((m: any) => (
            <div key={m.id} className="py-2 border-b border-zinc-800">
              {m.date} — {m.type}
            </div>
          ))}
        </div>
      )}

      {/* SHOWS */}
      {activeTab === "shows" && (
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800">
          {shows?.map((s: any) => (
            <div key={s.id} className="py-2 border-b border-zinc-800">
              {s.date} — {s.show_name}
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

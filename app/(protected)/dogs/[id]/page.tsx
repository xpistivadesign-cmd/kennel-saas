import { createServerSupabase } from "@/lib/supabase/server";
import DogBreedingSection from "./DogBreedingSection";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; edit?: string }>;
};

export default async function DogPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab, edit } = await searchParams;

  const activeTab = tab ?? "overview";
  const isEdit = edit === "true";

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return <div className="p-10 text-white">Dog not found</div>;
  }

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">{dog.name}</h1>

          <div className="flex gap-2">
            <Link
              href={`/dogs/${id}?tab=overview`}
              className="px-3 py-1 bg-zinc-800 rounded"
            >
              Overview
            </Link>
            <Link
              href={`/dogs/${id}?tab=pedigree`}
              className="px-3 py-1 bg-zinc-800 rounded"
            >
              Pedigree
            </Link>
            <Link
              href={`/dogs/${id}?tab=medical`}
              className="px-3 py-1 bg-zinc-800 rounded"
            >
              Medical
            </Link>
            <Link
              href={`/dogs/${id}?tab=shows`}
              className="px-3 py-1 bg-zinc-800 rounded"
            >
              Shows
            </Link>
            {dog.sex === "Female" && (
              <Link
                href={`/dogs/${id}?tab=breeding`}
                className="px-3 py-1 bg-amber-600 rounded"
              >
                Breeding
              </Link>
            )}
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="bg-zinc-900 p-6 rounded-lg space-y-3">
            <p className="text-lg">Breed: {dog.breed}</p>
            <p>Sex: {dog.sex}</p>
            <p>Color: {dog.color}</p>
            <p>Microchip: {dog.microchip}</p>
          </div>
        )}

        {activeTab === "breeding" && dog.sex === "Female" && (
          <DogBreedingSection dogId={dog.id} initialHeats={heats ?? []} />
        )}
      </div>
    </div>
  );
}

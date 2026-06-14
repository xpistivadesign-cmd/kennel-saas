import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import DogBreedingSection from "./DogBreedingSection";

import {
  updateDogProfileAction,
  addMedicalRecordAction,
  addShowResultAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function DogProfilePage({
  params,
  searchParams,
}: any) {
  const { id } = params;

  // ✅ FIX: cookies() IS NOW ASYNC (Next 16)
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

  if (!dog) return <div>Dog not found</div>;

  const { data: heatCycles } = await supabase
    .from("heat_cycles")
    .select("*")
    .eq("dog_id", id);

  const { data: matings } = await supabase
    .from("matings")
    .select("*")
    .eq("female_id", id);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">{dog.name}</h1>

      <DogBreedingSection
        dogId={id}
        heatCycles={heatCycles || []}
        matings={matings || []}
      />
    </div>
  );
}

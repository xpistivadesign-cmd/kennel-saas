import { createSupabaseServer } from "@/lib/db/supabase-server";
import LittersClient from "./LittersClient";

export const revalidate = 0;

export default async function LittersPage({
  searchParams,
}: {
  searchParams: Promise<{ litterId?: string }>;
}) {
  const supabase = createSupabaseServer();
  const { litterId } = await searchParams;

  // 1. Almok lekérésea legfrissebbel kezdve
  const { data: littersData } = await supabase
    .from("litters")
    .select("*")
    .order("created_at", { ascending: false });

  const litters = littersData || [];

  // 2. Kölykök lekérése az összes alomhoz
  const { data: puppiesData } = await supabase
    .from("puppies")
    .select("*");
  
  const puppies = puppiesData || [];

  // 3. Oltások lekérése
  const { data: vaccsData } = await supabase
    .from("puppy_vaccinations")
    .select("*");
  
  const vaccinations = vaccsData || [];

  // 4. Potenciális szülők lekérése a legördülő menükhöz (Kanok és Szukák külön)
  const { data: sires } = await supabase
    .from("dogs")
    .select("id, name")
    .eq("gender", "Male");

  const { data: dams } = await supabase
    .from("dogs")
    .select("id, name")
    .eq("gender", "Female");

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">LITTERS & BREEDING</h1>
        <p className="text-zinc-500 text-xs">Almok tervezése, születési adatok, törzskönyv és oltások kezelése.</p>
      </div>

      <LittersClient 
        litters={litters}
        puppies={puppies}
        vaccinations={vaccinations}
        potentialSires={sires || []}
        potentialDams={dams || []}
        activeLitterId={litterId || null}
      />
    </div>
  );
}

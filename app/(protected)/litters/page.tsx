import { createSupabaseServer } from "@/lib/db/supabase-server";
import LittersClient from "./LittersClient";

interface SearchParams {
  id?: string;
}

export default async function LittersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const supabase = createSupabaseServer();
  
  // Megvárjuk a searchParams feloldását (Next.js szabvány szerint)
  const resolvedParams = await searchParams;
  const activeLitterId = resolvedParams?.id || null;

  // 1. Lekérjük az almokat (kizárólag a nálad létező oszlopokkal)
  const { data: littersData } = await supabase
    .from("litters")
    .select("id, birth_date, notes, status, user_id, female_count, male_count")
    .order("created_at", { ascending: false });

  // 2. Lekérjük a kutyákat a szülőválasztóhoz
  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, sex");

  // 3. Lekérjük a kiskutyákat (a nálad létező oszlopokkal: id, collar_color, gender, birth_weight, litter_id, status)
  const { data: puppiesData } = await supabase
    .from("puppies")
    .select("id, collar_color, gender, birth_weight, litter_id, current_status")
    .order("created_at", { ascending: false });

  // Biztonságos alom átalakítás (hogy a felület ne hiányolja a letter/szülő oszlopokat)
  const safeLitters = (littersData || []).map((litter) => {
    const match = litter.notes?.match(/\[Alom jele\/betűje:\s*([^\]]+)\]/);
    const extractedLetter = match ? match[1] : `Alom (${litter.birth_date || "Tervezett"})`;

    return {
      ...litter,
      letter: extractedLetter, 
      sire_id: null,
      dam_id: null,
      sire_name: "N/A",
      dam_name: "N/A"
    };
  });

  // Kiskutyák átalakítása, ha a felület 'status'-t vár 'current_status' helyett
  const safePuppies = (puppiesData || []).map((pup) => ({
    ...pup,
    status: pup.current_status || "Available"
  }));

  // Szülők szűrése
  const potentialSires = (dogs || []).filter((d) => d.sex === "Male" || d.sex === "male");
  const potentialDams = (dogs || []).filter((d) => d.sex === "Female" || d.sex === "female");

  // Átadjuk az adatokat pontosan azokban a propokban, amiket a TypeScript hiányolt!
  return (
    <LittersClient 
      litters={safeLitters} 
      puppies={safePuppies}
      potentialSires={potentialSires}
      potentialDams={potentialDams}
      activeLitterId={activeLitterId}
    />
  );
}

import { createSupabaseServer } from "@/lib/db/supabase-server";
import LittersClient from "./LittersClient";

export default async function LittersPage() {
  const supabase = createSupabaseServer();

  // Csak a nálad garantáltan létező oszlopokat kérjük le
  const { data: littersData } = await supabase
    .from("litters")
    .select("id, birth_date, notes, status, user_id, female_count, male_count")
    .order("created_at", { ascending: false });

  // Biztonságos adat-átalakítás a hiányzó adatbázis oszlopok kompenzálására
  const safeLitters = (littersData || []).map((litter) => {
    // Kinyerjük az alom nevét/jelét a notes mezőből, ha korábban oda mentettük
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

  // CSAK azt adjuk át a kliensnek, amit a hibaüzenet alapján biztosan vár és elfogad (a litters-t)
  return (
    <LittersClient 
      litters={safeLitters} 
    />
  );
}

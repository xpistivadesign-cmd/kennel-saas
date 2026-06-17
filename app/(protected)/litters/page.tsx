import { createSupabaseServer } from "@/lib/db/supabase-server";
import LittersClient from "./LittersClient";

export default async function LittersPage() {
  const supabase = createSupabaseServer();

  // Kizárólag a nálad 100%-ban létező oszlopokat kérjük le az adatbázisból
  const { data: littersData } = await supabase
    .from("litters")
    .select("id, birth_date, notes, status, user_id, female_count, male_count")
    .order("created_at", { ascending: false });

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, sex");

  // Átformázzuk a rekordokat, hogy a felület ne hiányolja a hiányzó adatbázis mezőket
  const safeLitters = (littersData || []).map((litter) => {
    // Megpróbáljuk kiszedni a nevet/betűt a notes-ból, ha ott van
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

  const sires = (dogs || []).filter((d) => d.sex === "Male" || d.sex === "male");
  const dams = (dogs || []).filter((d) => d.sex === "Female" || d.sex === "female");

  return (
    <LittersClient 
      litters={safeLitters} // Átírva initialLitters-ről sima litters-re, hogy a TypeScript boldog legyen!
      sires={sires} 
      dams={dams} 
    />
  );
}

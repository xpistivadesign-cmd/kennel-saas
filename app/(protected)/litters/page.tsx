import { createSupabaseServer } from "@/lib/db/supabase-server";
import LittersClient from "./LittersClient";

export default async function LittersPage() {
  const supabase = createSupabaseServer();

  // Csak azokat az oszlopokat kérjük le, amik 100%, hogy léteznek nálad az adatbázisban!
  const { data: littersData } = await supabase
    .from("litters")
    .select("id, birth_date, notes, status, user_id, female_count, male_count")
    .order("created_at", { ascending: false });

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, sex");

  // Átformázzuk az adatokat a kliens komponens számára, hogy ne hiányolja a 'letter'-t
  const safeLitters = (littersData || []).map((litter) => {
    // Megpróbáljuk kibányászni a mentett nevet/jelet a notes-ból, ha létezik
    const match = litter.notes?.match(/\[Alom jele\/betűje:\s*([^\]]+)\]/);
    const extractedLetter = match ? match[1] : `Alom (${litter.birth_date || "Tervezett"})`;

    return {
      ...litter,
      letter: extractedLetter, // ezt fogja megjeleníteni névként a táblázatban
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
      initialLitters={safeLitters} 
      sires={sires} 
      dams={dams} 
    />
  );
}

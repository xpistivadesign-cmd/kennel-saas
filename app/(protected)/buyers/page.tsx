import { createSupabaseServer } from "@/lib/db/supabase-server";
import BuyersClient from "./BuyersClient";

export const revalidate = 0;

export default async function BuyersPage() {
  const supabase = createSupabaseServer();

  // Gazdik lekérése
  const { data: buyersData } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  // Kiskutyák lekérése a szerződés generáláshoz
  const { data: puppiesData } = await supabase
    .from("puppies")
    .select("id, name, collar_color, birth_weight, status, microchip_number, pedigree_number");

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">WAITLIST & BUYERS</h1>
        <p className="text-zinc-500 text-xs">Várólista menedzsment, gazdi adatbázis és automatikus adásvételi szerződés generátor.</p>
      </div>

      <BuyersClient 
        buyers={buyersData || []} 
        puppies={puppiesData || []} 
      />
    </div>
  );
}

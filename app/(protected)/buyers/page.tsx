import { createServerSupabase } from "@/lib/supabase/server";
import BuyersClient from "./BuyersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuyersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await props.searchParams; 
  const supabase = createServerSupabase();

  // 1. Gazdik / Várólistások lekérése
  const { data: buyersData } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Kiskutyák lekérése a kapcsolathoz és szerződéshez
  const { data: puppiesData } = await supabase
    .from("puppies")
    .select("id, name, collar_color, status, microchip_number, pedigree_number, buyer_name, sale_price");

  // 3. Mentett szerződések lekérése
  const { data: contractsData } = await supabase
    .from("contracts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">WAITLIST & BUYERS</h1>
        <p className="text-zinc-500 text-xs mt-1">Várólista menedzsment, gazdi adatbázis, tulajdonolt kutyák és digitális szerződéstár.</p>
      </div>

      <BuyersClient 
        buyers={buyersData || []} 
        puppies={puppiesData || []} 
        contracts={contractsData || []}
      />
    </div>
  );
}

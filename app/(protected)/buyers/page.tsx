import { createServerSupabase } from "@/lib/supabase/server";
import BuyersClient from "./BuyersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BuyersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Next.js 15+ kompatibilitás
  await props.searchParams; 
  const supabase = createServerSupabase();

  // 1. Gazdik / Várólistások lekérése
  const { data: buyersData, error: buyersError } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  if (buyersError) {
    console.error("Buyers lekérési hiba:", buyersError.message);
  }

  // 2. Kiskutyák lekérése a szerződés generáláshoz
  const { data: puppiesData, error: puppiesError } = await supabase
    .from("puppies")
    .select("id, name, collar_color, status, microchip_number, pedigree_number");

  if (puppiesError) {
    console.error("Puppies lekérési hiba:", puppiesError.message);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">WAITLIST & BUYERS</h1>
        <p className="text-zinc-500 text-xs mt-1">Várólista menedzsment, gazdi adatbázis és automatikus adásvételi szerződés generátor.</p>
      </div>

      <BuyersClient 
        buyers={buyersData || []} 
        puppies={puppiesData || []} 
      />
    </div>
  );
}

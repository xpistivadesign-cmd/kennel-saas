import { createSupabaseServer } from "@/lib/db/supabase-server";
import BuyersClient from "./BuyersClient";

export const revalidate = 0;

export default async function BuyersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Biztosítjuk a modern Next.js aszinkron paraméter-kezelést
  await props.searchParams; 
  const supabase = createSupabaseServer();

  // 1. Gazdik / Várólistások lekérése
  const { data: buyersData } = await supabase
    .from("buyers")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Kiskutyák lekérése a szerződés generáláshoz
  const { data: puppiesData } = await supabase
    .from("puppies")
    .select("id, name, collar_color, birth_weight, status, microchip_number, pedigree_number");

  return (
    <div className="p-4 bg-black min-h-screen text-white space-y-4">
      <div className="border-b border-zinc-800 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-amber-400">WAITLIST & BUYERS</h1>
        <p className="text-zinc-500 text-[11px]">Várólista menedzsment, gazdi adatbázis és automatikus adásvételi szerződés generátor.</p>
      </div>

      <BuyersClient 
        buyers={buyersData || []} 
        puppies={puppiesData || []} 
      />
    </div>
  );
}

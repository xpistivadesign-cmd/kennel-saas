import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HeatsClient from "./HeatsClient";

export const dynamic = "force-dynamic";

export default async function HeatsPage() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Lekérjük az összes kutyát a név-párosításhoz és a lenyílóhoz
  const { data: allDogs } = await supabase
    .from("dogs")
    .select("id, name, sex")
    .order("name", { ascending: true });

  // 2. Lekérjük a tüzelési ciklusokat a heat_cycles táblából
  const { data: rawHeatCycles } = await supabase
    .from("heat_cycles")
    .select("id, start_date, notes, dog_id")
    .order("start_date", { ascending: false });

  // Kiszűrjük a szuka kutyákat a lenyíló menühöz (csak Female)
  const femaleDogs = allDogs?.filter((d: any) => d.sex === "Female") || [];

  // Összepárosítjuk a tüzeléseket a kutyák neveivel a memóriában (így nincs SQL JOIN hiba!)
  const heatCycles = (rawHeatCycles || []).map((heat: any) => {
    const foundDog = (allDogs || []).find((d: any) => d.id === heat.dog_id);
    return {
      ...heat,
      dog_name: foundDog ? foundDog.name : "Unknown Female"
    };
  });

  return <HeatsClient heatCycles={heatCycles} femaleDogs={femaleDogs} />;
}

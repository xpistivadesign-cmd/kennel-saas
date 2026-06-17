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

  let allDogs: any[] = [];
  let rawHeatCycles: any[] = [];

  try {
    // 1. Kutyák lekérése biztonságosan
    const { data: dogsData } = await supabase
      .from("dogs")
      .select("id, name, sex")
      .order("name", { ascending: true });
    
    if (dogsData) allDogs = dogsData;

    // 2. Tüzelések lekérése biztonságosan
    const { data: heatsData } = await supabase
      .from("heat_cycles")
      .select("id, start_date, notes, dog_id")
      .order("start_date", { ascending: false });
    
    if (heatsData) rawHeatCycles = heatsData;
  } catch (e) {
    console.error("Hiba az adatok lekérése közben:", e);
  }

  // Kizárólag a szukák (Female) szűrése a lenyílóhoz
  const femaleDogs = allDogs.filter((d: any) => d.sex === "Female");

  // Összepárosítás
  const heatCycles = rawHeatCycles.map((heat: any) => {
    const foundDog = allDogs.find((d: any) => d.id === heat.dog_id);
    return {
      ...heat,
      dog_name: foundDog ? foundDog.name : "Unknown Female"
    };
  });

  return <HeatsClient heatCycles={heatCycles} femaleDogs={femaleDogs} />;
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LittersClient from "./LittersClient";

export const dynamic = "force-dynamic";

export default async function LittersPage({ searchParams }: any) {
  const cookieStore = await cookies();
  const resolvedSearchParams = await searchParams;
  const activeLitterId = resolvedSearchParams.id || null;

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

  // 1. Almok lekérése
  const { data: litters } = await supabase
    .from("litters")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. Kiskutyák lekérése
  const { data: puppies } = await supabase
    .from("puppies")
    .select("*")
    .order("created_at", { ascending: true });

  // 3. Potenciális szülők listája a legördülőhöz
  const { data: allDogs } = await supabase.from("dogs").select("id, name, sex");
  const potentialSires = allDogs?.filter((d: any) => d.sex === "Male") || [];
  const potentialDams = allDogs?.filter((d: any) => d.sex === "Female") || [];

  return (
    <LittersClient 
      litters={litters || []} 
      puppies={puppies || []} 
      potentialSires={potentialSires} 
      potentialDams={potentialDams}
      activeLitterId={activeLitterId}
    />
  );
}

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

  // SQL JOIN: Lekérjük a tüzeléseket ÉS a hozzájuk tartozó kutyák nevét
  const { data: heatCycles } = await supabase
    .from("heat_cycles")
    .select(`
      id,
      start_date,
      notes,
      dog_id,
      dogs (
        name
      )
    `)
    .order("start_date", { ascending: false });

  // Csak a szuka (Female) kutyák átadása a lenyílóhoz
  const { data: femaleDogs } = await supabase
    .from("dogs")
    .select("id, name")
    .eq("sex", "Female")
    .order("name", { ascending: true });

  return <HeatsClient heatCycles={heatCycles || []} femaleDogs={femaleDogs || []} />;
}

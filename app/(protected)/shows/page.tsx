import { createServerSupabase } from "@/lib/supabase/server";
import ShowsClient from "./ShowsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShowsPage() {
  const supabase = createServerSupabase();

  // 1. Események lekérése a benevezett kutyákkal és eredményekkel együtt
  const { data: eventsData } = await supabase
    .from("events")
    .select(`
      *,
      event_entries (
        id,
        dog_id,
        class_entered,
        placement,
        titles_won,
        report_text,
        dogs ( id, name, kennels )
      )
    `)
    .order("date", { ascending: true });

  // 2. Aktív kutyák lekérése a benevezési űrlaphoz
  const { data: dogsData } = await supabase
    .from("dogs")
    .select("id, name");

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-amber-400">EVENTS, SHOWS & EXAMS</h1>
        <p className="text-zinc-500 text-xs mt-1">Kiállítások, munkavizsgák, sportversenyek szervezése, nevezések és eredmények követése.</p>
      </div>

      <ShowsClient 
        events={eventsData || []} 
        dogs={dogsData || []} 
      />
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import ShowsClient from "./ShowsClient";

export const dynamic = "force-dynamic";

export default async function ShowsPage() {
  const supabase = createServerSupabase();

  // 1. Felhasználó lekérése
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Kutyák lekérése az űrlaphoz
  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name")
    .order("name", { ascending: true });

  // 3. Események lekérése az összes hozzá tartozó nevezéssel együtt
  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      title,
      event_type,
      date,
      location,
      judge,
      entry_fee,
      currency,
      notes,
      event_entries (
        id,
        class_entered,
        placement,
        titles_won,
        report_text,
        dogs (
          id,
          name
        )
      )
    `)
    .order("date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-amber-500 font-sans uppercase">Events, Shows & Exams</h1>
        <p className="text-zinc-500 text-xs mt-1">Kiállítások, munkavizsgák, sportversenyek szervezése, nevezések és eredmények követése.</p>
      </div>

      <ShowsClient events={events || []} dogs={dogs || []} />
    </div>
  );
}

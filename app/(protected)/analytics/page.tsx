import { createClient } from "@/utils/supabase/server";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: heats } = await supabase
    .from("heats")
    .select(`
      id,
      start_date,
      end_date,
      dog_id,
      progesterone_tests (
        id,
        test_date,
        value
      )
    `)
    .order("start_date", { ascending: false });

  return <AnalyticsClient heats={heats ?? []} />;
}
import { createClient } from "@/utils/supabase/server";
import AnalyticsClient from "../analytics/AnalyticsClient";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: heats } = await supabase
    .from("heats")
    .select(`
      id,
      dog_id,
      start_date,
      end_date,
      progesterone_tests (
        id,
        test_date,
        value
      )
    `)
    .order("start_date", { ascending: false });

  return <AnalyticsClient heats={heats || []} />;
}
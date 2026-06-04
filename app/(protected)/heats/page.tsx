import { createClient } from "@/utils/supabase/server";
import AnalyticsClient from "../analytics/AnalyticsClient";

export default async function HeatsPage() {
  const supabase = await createClient();

  const { data: heats, error } = await supabase
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

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading data
      </div>
    );
  }

  return <AnalyticsClient heats={heats || []} />;
}
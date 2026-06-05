export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";
import MatingPlannerClient from "./MatingPlannerClient";

export default async function MatingPlannerPage() {
  const supabase = createServerSupabase();

  const { data: dogs } = await supabase.from("dogs").select("*");

  return (
    <MatingPlannerClient dogs={dogs ?? []} />
  );
}

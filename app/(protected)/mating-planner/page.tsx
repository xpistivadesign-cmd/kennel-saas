import { createServerSupabase } from "@/lib/supabase/server";
import MatingPlannerClient from "./MatingPlannerClient";

export default async function MatingPlannerPage() {
  const supabase = createServerSupabase();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*");

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        🧬 Mating Planner
      </h1>

      <MatingPlannerClient dogs={dogs ?? []} />
    </div>
  );
}

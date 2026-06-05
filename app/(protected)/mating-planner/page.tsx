import MatingPlannerClient from "./MatingPlannerClient";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const { data: dogs } = await supabase.from("dogs").select("*");

  return <MatingPlannerClient dogs={(dogs as any[]) ?? []} />;
}

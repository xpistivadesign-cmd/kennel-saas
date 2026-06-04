import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: tests } = await supabase
    .from("progesterone_tests")
    .select("value, heat_id");

  const alerts =
    tests?.filter(t => t.value >= 5 && t.value <= 8) ?? [];

  return new Response(
    JSON.stringify({
      status: "OK",
      optimal_zone_hits: alerts.length,
      alerts,
    }),
    {
      headers: { "Content-Type": "application/json" }
    }
  );
});
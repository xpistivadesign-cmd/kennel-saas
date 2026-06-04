import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PregnancyRow = {
  user_id: string;
  female_dog_name: string;
  ultrasound_date: string;
  xray_date: string;
  expected_whelping_date: string;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  try {
    const { data, error } = await supabase
      .from("pregnancy_timeline_view")
      .select("*");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const grouped: Record<string, PregnancyRow[]> = {};
    let totalAlerts = 0;

    const rows = (data ?? []) as PregnancyRow[];

    for (const row of rows) {
      const isUrgent =
        row.ultrasound_date === today ||
        row.xray_date === today ||
        row.expected_whelping_date === today;

      if (!isUrgent) continue;

      if (!grouped[row.user_id]) {
        grouped[row.user_id] = [];
      }

      grouped[row.user_id].push(row);
      totalAlerts++;
    }

    return new Response(
      JSON.stringify({
        ok: true,
        processed_date: today,
        triggered_users: Object.keys(grouped).length,
        total_alerts: totalAlerts,
        grouped,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "fatal error",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
});
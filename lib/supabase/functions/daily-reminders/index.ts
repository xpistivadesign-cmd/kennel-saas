import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PregnancyRow = {
  user_id: string;
  female_dog_name: string;
  ultrasound_date: string;
  xray_date: string;
  expected_whelping_date: string;
};

Deno.serve(async () => {
  try {
    // 🔐 ENV CHECK (NO NON-NULL ASSERTIONS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Missing SUPABASE_URL or SERVICE_ROLE_KEY",
        }),
        { status: 500 }
      );
    }

    // ⚙️ Admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 📦 Fetch ALL pregnancies
    const { data, error } = await supabase
      .from("pregnancy_timeline_view")
      .select(`
        user_id,
        female_dog_name,
        ultrasound_date,
        xray_date,
        expected_whelping_date
      `);

    if (error) {
      console.error("DB error:", error.message);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    const rows: PregnancyRow[] = data ?? [];

    const today = new Date().toISOString().split("T")[0];

    // 🧠 GROUPING FIX (DEFINED PROPERLY)
    const grouped: Record<string, PregnancyRow[]> = {};

    for (const row of rows) {
      if (!grouped[row.user_id]) {
        grouped[row.user_id] = [];
      }
      grouped[row.user_id].push(row);
    }

    // 🔔 RESULTS CONTAINER (FIXED SCOPE)
    const results: {
      user_id: string;
      events: PregnancyRow[];
    }[] = [];

    // 👇 SAFE LOOP (NO UNDEFINED VARIABLES)
    for (const id of Object.keys(grouped)) {
      const userEvents = grouped[id];

      const todayEvents = userEvents.filter((event) => {
        return (
          event.ultrasound_date === today ||
          event.xray_date === today ||
          event.expected_whelping_date === today
        );
      });

      if (todayEvents.length > 0) {
        results.push({
          user_id: id,
          events: todayEvents,
        });

        console.log(
          `🔔 User ${id} has ${todayEvents.length} event(s) today`
        );
      }
    }

    // 📤 RESPONSE
    return new Response(
      JSON.stringify({
        ok: true,
        processed_users: Object.keys(grouped).length,
        triggered_users: results.length,
        results,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    console.error("Fatal error:", err);

    return new Response(
      JSON.stringify({
        error: "Unexpected failure",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 500 }
    );
  }
});
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export default async function handler() {
  // 🔥 Lekérjük a legfrissebb progeszteron méréseket
  const { data, error } = await supabase
    .from("progesterone_tests")
    .select(`
      id,
      value,
      test_date,
      heat_id,
      heats (
        id,
        dog_id
      )
    `)
    .order("test_date", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  const alerts: any[] = [];

  for (const test of data ?? []) {
    const value = test.value;

    // 🚨 KRITIKUS ABLAK: 5–8 ng/ml
    if (value >= 5 && value <= 8) {
      alerts.push({
        heat_id: test.heat_id,
        dog_id: test.heats?.dog_id,
        value,
        message: "Ideális fedeztetési időablak: 24–48 órán belül!",
        severity: "HIGH",
        date: test.test_date,
      });
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      alerts_count: alerts.length,
      alerts,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
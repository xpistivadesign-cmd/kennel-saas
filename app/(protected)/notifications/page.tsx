import { createClient } from "@/utils/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data: heats } = await supabase
    .from("heats")
    .select("id, start_date, end_date, dog_id");

  const activeHeats =
    heats?.filter((h) => !h.end_date) || [];

  const alerts = activeHeats.map((h) => ({
    id: h.id,
    type: "HEAT_ACTIVE",
    message: `Aktív tüzelés: ${h.dog_id.slice(0, 6)}`,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">🔔 Értesítések</h1>

      {alerts.length === 0 ? (
        <p className="text-gray-500">Nincs értesítés</p>
      ) : (
        alerts.map((a) => (
          <div key={a.id} className="border rounded-xl p-4 bg-white">
            <div className="text-sm font-bold">{a.type}</div>
            <div className="text-xs text-gray-500">{a.message}</div>
          </div>
        ))
      )}
    </div>
  );
}
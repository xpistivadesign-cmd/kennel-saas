import { getHeatsByDog } from "@/app/actions/heats";

export default async function DashboardPage() {
  const heats = await getHeatsByDog("demo-dog-id");

  const latestHeat = heats[0];

  const latestProg =
    latestHeat?.progesterone_tests?.slice(-1)[0]?.value ?? 0;

  const isOvulationWindow = latestProg >= 5 && latestProg <= 15;

  const nextActions = isOvulationWindow
    ? ["BREED NOW", "DAILY MATING WINDOW ACTIVE"]
    : ["WAIT", "CONTINUE TESTING"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Kennel Dashboard</h1>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          Active Heats: {heats.filter(h => h.status === "active").length}
        </div>
        <div className="p-4 border rounded">
          Latest Progesterone: {latestProg} ng/ml
        </div>
        <div className="p-4 border rounded">
          Status: {latestHeat?.status ?? "none"}
        </div>
      </div>

      {/* SMART ALERT */}
      <div
        className={`p-4 rounded text-white ${
          isOvulationWindow ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        <h2 className="font-bold">SMART ALERT</h2>
        <ul className="list-disc ml-5">
          {nextActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>

      {/* BREEDING WINDOW */}
      <div className="border p-4 rounded">
        <h2 className="font-bold mb-2">Best Mating Window</h2>

        {isOvulationWindow ? (
          <div className="text-green-600 font-bold text-lg">
            OVULATION DETECTED — BREED NOW
          </div>
        ) : (
          <div>Monitoring progesterone curve...</div>
        )}
      </div>
    </div>
  );
}

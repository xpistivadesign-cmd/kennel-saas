import { createClient } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: tests } = await supabase
    .from("progesterone_tests")
    .select(`
      id,
      value,
      test_date,
      heat_id
    `)
    .order("test_date", { ascending: true });

  const { data: matings } = await supabase
    .from("matings")
    .select(`
      id,
      heat_id,
      first_mating_date
    `);

  const chartData =
    tests?.map((t) => ({
      date: new Date(t.test_date).toLocaleDateString("hu-HU"),
      value: Number(t.value),
      heat_id: t.heat_id,
    })) ?? [];

  const maxValue = Math.max(
    ...chartData.map((d) => d.value),
    10
  );

  const width = 900;
  const height = 300;

  const points = chartData
    .map((item, index) => {
      const x =
        chartData.length <= 1
          ? width / 2
          : (index / (chartData.length - 1)) * width;

      const y =
        height -
        (item.value / maxValue) * (height - 20);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Analitika 📈
        </h1>
        <p className="text-gray-500">
          Progeszteron görbe és pároztatási események.
        </p>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">
          Progeszteron trend
        </h2>

        {chartData.length === 0 ? (
          <p className="text-gray-400">
            Nincs még rögzített mérés.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <svg
              width={width}
              height={height}
              className="min-w-[900px]"
            >
              <line
                x1="0"
                y1={height}
                x2={width}
                y2={height}
                stroke="#d1d5db"
              />

              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                points={points}
              />

              {chartData.map((item, index) => {
                const x =
                  chartData.length <= 1
                    ? width / 2
                    : (index /
                        (chartData.length - 1)) *
                      width;

                const y =
                  height -
                  (item.value / maxValue) *
                    (height - 20);

                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#2563eb"
                    />

                    <text
                      x={x}
                      y={height + 20}
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.date}
                    </text>

                    <text
                      x={x}
                      y={y - 10}
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {item.value}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">
          Pároztatások
        </h2>

        <div className="space-y-3">
          {matings?.length ? (
            matings.map((m) => (
              <div
                key={m.id}
                className="border rounded-lg p-3"
              >
                <div className="font-medium">
                  Pároztatás
                </div>
                <div className="text-sm text-gray-500">
                  {m.first_mating_date}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">
              Nincs pároztatás rögzítve.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
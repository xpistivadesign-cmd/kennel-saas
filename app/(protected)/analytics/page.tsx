import { getAnalyticsData } from "@/app/actions/analytics";

export default async function AnalyticsPage() {
  const testData = await getAnalyticsData();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Kennel Analitika 📊
        </h1>

        <p className="text-gray-500 mt-1">
          A progeszteron szintek alakulása és
          biológiai csúcspontok követése.
        </p>
      </div>

      {testData.length === 0 ? (
        <div className="bg-white border border-dashed rounded-xl p-8 text-center text-gray-400">
          Nincs még rögzített progeszteron teszt.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">
            Progeszteron Trendek
          </h2>

          <div className="space-y-5">
            {testData.map((test: any) => {
              const value = Number(test.value ?? 0);

              const percentage = Math.min(
                Math.round((value / 20) * 100),
                100
              );

              let barColor =
                "bg-blue-500";

              let statusText =
                "Alap szint";

              if (value >= 2 && value < 5) {
                barColor =
                  "bg-yellow-500";
                statusText =
                  "LH csúcs közelít ⏱️";
              } else if (
                value >= 5 &&
                value <= 10
              ) {
                barColor =
                  "bg-emerald-500";
                statusText =
                  "OVULÁCIÓ 🔥";
              } else if (value > 10) {
                barColor =
                  "bg-purple-600";
                statusText =
                  "Post-ovuláció";
              }

              const dogName =
                test.heats?.dogs?.name ??
                "Ismeretlen kutya";

              const cycleDate =
                test.heats?.start_date ??
                "-";

              const testDate =
                test.test_date
                  ?.split("T")[0] ?? "-";

              return (
                <div
                  key={test.id}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      {dogName} • Ciklus:
                      {" "}
                      {cycleDate} •
                      {" "}
                      Teszt:
                      {" "}
                      {testDate}
                    </span>

                    <span className="font-semibold">
                      {statusText}
                    </span>
                  </div>

                  <div className="w-full h-8 rounded-lg overflow-hidden bg-gray-100 border">
                    <div
                      style={{
                        width: `${percentage}%`,
                      }}
                      className={`${barColor} h-full flex items-center px-3 text-white text-sm font-bold transition-all duration-500`}
                    >
                      {value} ng/mL
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
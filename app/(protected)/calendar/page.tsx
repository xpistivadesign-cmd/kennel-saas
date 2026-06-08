export const dynamic = "force-dynamic";
import { getActivePregnancies } from "@/app/actions/bridge";

const EVENT_ICONS = {
  ultrasound: "🧬",
  xray: "🩻",
  whelping: "🍼",
} as const;

export default async function CalendarPage() {
  const pregnancies = await getActivePregnancies();

  const events = pregnancies.flatMap((p: any) => [
    {
      id: `${p.mating_id}-ultrasound`,
      type: "ultrasound",
      date: p.ultrasound_date,
      dogName: p.female_dog_name,
      title: "Ultrahang",
    },
    {
      id: `${p.mating_id}-xray`,
      type: "xray",
      date: p.xray_date,
      dogName: p.female_dog_name,
      title: "Röntgen",
    },
    {
      id: `${p.mating_id}-whelping`,
      type: "whelping",
      date: p.expected_whelping_date,
      dogName: p.female_dog_name,
      title: "Várható ellés",
    },
  ]);

  events.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Tenyésztési Naptár 📅
        </h1>

        <p className="text-gray-500 mt-1">
          Automatikusan generált tenyésztési események,
          vizsgálatok és várható ellések.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-400">
          Jelenleg nincs közelgő esemény.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <span>
                      {
                        EVENT_ICONS[
                          event.type as keyof typeof EVENT_ICONS
                        ]
                      }
                    </span>

                    <span>{event.title}</span>
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {event.dogName}
                  </div>
                </div>

                <div className="font-bold text-emerald-600 whitespace-nowrap">
                  {event.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

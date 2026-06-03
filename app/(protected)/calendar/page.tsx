import { getCalendarEvents } from "@/app/actions/calendar";

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  dogName: string;
  eventType: "ultrasound" | "xray" | "whelping";
};

const EVENT_ICONS: Record<CalendarEvent["eventType"], string> = {
  ultrasound: "🧬",
  xray: "🩻",
  whelping: "🍼",
};

export default async function CalendarPage() {
  const calendarEvents =
    (await getCalendarEvents()) as CalendarEvent[];

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

      <div className="space-y-4">
        {calendarEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400">
            Jelenleg nincs közelgő esemény.
          </div>
        ) : (
          calendarEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <span>
                      {EVENT_ICONS[event.eventType] ?? "📅"}
                    </span>

                    <span>{event.title}</span>
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    {event.dogName}
                  </div>
                </div>

                <div className="font-bold text-emerald-600 whitespace-nowrap">
                  {event.date}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
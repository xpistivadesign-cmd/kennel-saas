import { createClient } from "@/lib/supabase/server";
import { getDogShows, createShowRecord } from "@/app/actions/shows";

export default async function ShowsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name")
    .order("name", { ascending: true });

  const shows = await getDogShows();

  const totalShows = shows.length;

  const firstPlaces = shows.filter((s) => s.placement === 1).length;

  const championTitles = shows.filter(
    (s) =>
      s.titles_won?.includes("BOB") ||
      s.titles_won?.includes("BIS") ||
      s.titles_won?.includes("CH")
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">🏆 Dog Shows & Achievements</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500">Total Shows</p>
          <p className="text-2xl font-bold">{totalShows}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500">Champion Titles</p>
          <p className="text-2xl font-bold">{championTitles}</p>
        </div>

        <div className="p-4 border rounded-xl">
          <p className="text-xs text-gray-500">1st Places</p>
          <p className="text-2xl font-bold">{firstPlaces}</p>
        </div>
      </div>

      {/* CREATE FORM */}
      <form
        action={async (formData) => {
          "use server";

          await createShowRecord({
            dog_id: formData.get("dog_id") as string,
            show_name: formData.get("show_name") as string,
            show_date: formData.get("show_date") as string,
            location: formData.get("location") as string,
            judge_name: formData.get("judge_name") as string,
            class: formData.get("class") as string,
            placement: Number(formData.get("placement") || 0) || undefined,
            titles_won: formData.get("titles_won") as string,
            notes: formData.get("notes") as string,
          });
        }}
        className="space-y-3 border p-4 rounded-xl"
      >
        <select name="dog_id" className="border p-2 w-full" required>
          <option value="">Select Dog</option>
          {dogs?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input
          name="show_name"
          placeholder="Show name"
          className="border p-2 w-full"
          required
        />

        <input
          name="show_date"
          type="date"
          className="border p-2 w-full"
          required
        />

        <input
          name="location"
          placeholder="Location"
          className="border p-2 w-full"
        />

        <input
          name="judge_name"
          placeholder="Judge"
          className="border p-2 w-full"
        />

        <input
          name="class"
          placeholder="Class (Open, Puppy...)"
          className="border p-2 w-full"
        />

        <input
          name="placement"
          type="number"
          placeholder="Placement (1,2,3...)"
          className="border p-2 w-full"
        />

        <input
          name="titles_won"
          placeholder="Titles (BOB, BOS, CH...)"
          className="border p-2 w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Add Show Result
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-3">
        {shows.map((s) => (
          <div key={s.id} className="border rounded-xl p-4">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{s.show_name}</p>
                <p className="text-sm text-gray-500">
                  {s.location ?? "Unknown location"} •{" "}
                  {new Date(s.show_date).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                {s.placement && (
                  <p className="font-bold">#{s.placement}</p>
                )}
                {s.titles_won && (
                  <p className="text-sm">{s.titles_won}</p>
                )}
              </div>
            </div>

            <div className="text-sm mt-2">
              <p>Judge: {s.judge_name ?? "-"}</p>
              <p>Class: {s.class ?? "-"}</p>
              {s.notes && <p className="italic mt-1">{s.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

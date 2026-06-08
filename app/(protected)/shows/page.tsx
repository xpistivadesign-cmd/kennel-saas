import { createClient } from "@/lib/supabase/server";
import { createShowRecord, getDogShows } from "@/app/actions/shows";

export default async function ShowsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name");

  const shows = await getDogShows();

  const totalShows = shows.length;

  const firstPlaces = shows.filter(s => s.placement === 1).length;

  const championTitles = shows.filter(s =>
    (s.titles_won ?? "").includes("CH")
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Dog Shows & Achievements</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4 rounded-xl">
          <p className="text-sm text-gray-500">Total Shows</p>
          <p className="text-2xl font-bold">{totalShows}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <p className="text-sm text-gray-500">Champion Titles</p>
          <p className="text-2xl font-bold">{championTitles}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <p className="text-sm text-gray-500">First Places</p>
          <p className="text-2xl font-bold">{firstPlaces}</p>
        </div>
      </div>

      <form
        action={async formData => {
          "use server";

          await createShowRecord({
            dog_id: formData.get("dog_id") as string,
            show_name: formData.get("show_name") as string,
            show_date: formData.get("show_date") as string,
            location: formData.get("location") as string,
            judge_name: formData.get("judge_name") as string,
            class: formData.get("class") as string,
            placement: Number(formData.get("placement")) || undefined,
            titles_won: formData.get("titles_won") as string,
            notes: formData.get("notes") as string
          });
        }}
        className="space-y-3 border p-4 rounded-xl"
      >
        <select name="dog_id" className="border p-2 w-full" required>
          <option value="">Select Dog</option>
          {dogs?.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <input name="show_name" className="border p-2 w-full" placeholder="Show name" required />

        <input type="date" name="show_date" className="border p-2 w-full" required />

        <input name="location" className="border p-2 w-full" placeholder="Location" />

        <input name="judge_name" className="border p-2 w-full" placeholder="Judge" />

        <input name="class" className="border p-2 w-full" placeholder="Class" />

        <input name="placement" type="number" className="border p-2 w-full" placeholder="Placement" />

        <input name="titles_won" className="border p-2 w-full" placeholder="Titles (CH, GCH...)" />

        <textarea name="notes" className="border p-2 w-full" placeholder="Notes" />

        <button className="bg-black text-white px-4 py-2 rounded">
          Add Show
        </button>
      </form>

      <div className="space-y-3">
        {shows.map(s => (
          <div key={s.id} className="border p-4 rounded-xl">
            <div className="flex justify-between">
              <div>
                <p className="font-bold">{s.show_name}</p>
                <p className="text-sm text-gray-500">
                  {s.location} • {s.show_date}
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

            {s.judge_name && (
              <p className="text-xs text-gray-500 mt-2">
                Judge: {s.judge_name}
              </p>
            )}

            {s.notes && (
              <p className="text-xs italic mt-1">{s.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

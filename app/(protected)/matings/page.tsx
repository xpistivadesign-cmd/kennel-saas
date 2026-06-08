import {
  createMating,
  deleteMating,
  getMatings,
} from "@/app/actions/matings";

export default async function MatingsPage() {
  const matings = await getMatings();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Matings</h1>

      {/* CREATE FORM */}
      <form
        action={async (formData) => {
          "use server";

          await createMating({
            heat_id: formData.get("heat_id") as string,

            mating_type:
              (formData.get("mating_type") as string) || "natural",

            stud_dog_id: undefined,

            outside_stud_name:
              (formData.get("male_name") as string) || undefined,

            first_mating_date: new Date(
              formData.get("mating_date") as string
            ).toISOString(),

            chase_mating_date: undefined,

            notes: (formData.get("notes") as string) || undefined,
          });
        }}
        className="space-y-3 p-4 border rounded"
      >
        <input
          name="heat_id"
          placeholder="Heat ID"
          className="border p-2 w-full"
          required
        />

        <input
          name="mating_date"
          type="datetime-local"
          className="border p-2 w-full"
          required
        />

        <select
          name="mating_type"
          className="border p-2 w-full"
          defaultValue="natural"
        >
          <option value="natural">Natural</option>
          <option value="ai_chilled">AI chilled</option>
          <option value="ai_frozen">AI frozen</option>
        </select>

        <input
          name="male_name"
          placeholder="Outside stud name"
          className="border p-2 w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Add mating
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-3">
        {matings?.map((m) => (
          <div
            key={m.id}
            className="border p-3 rounded flex justify-between items-start"
          >
            <div>
              <div className="font-semibold">
                {new Date(
                  m.first_mating_date
                ).toLocaleString()}
              </div>

              <div className="text-sm">
                Type: {m.mating_type}
              </div>

              {m.outside_stud_name && (
                <div className="text-sm">
                  Male: {m.outside_stud_name}
                </div>
              )}

              {m.notes && (
                <div className="text-sm italic">
                  {m.notes}
                </div>
              )}
            </div>

            <form
              action={async () => {
                "use server";
                await deleteMating(m.id);
              }}
            >
              <button className="text-red-500 text-sm">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

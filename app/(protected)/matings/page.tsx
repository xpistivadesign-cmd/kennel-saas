import {
  createMating,
  deleteMating,
  getMatings,
  type MatingType,
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

          const method = formData.get("method") as MatingMethod | "";

          await createMating({
            heat_id: formData.get("heat_id") as string,
            mating_date: new Date(
              formData.get("mating_date") as string
            ).toISOString(),
            male_name: formData.get("male_name") as string,
            method: method || undefined,
            notes: formData.get("notes") as string,
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

        <input
          name="male_name"
          placeholder="Male name"
          className="border p-2 w-full"
        />

        <select name="method" className="border p-2 w-full">
          <option value="">Method</option>
          <option value="natural">Natural</option>
          <option value="ai">AI</option>
          <option value="tci">TCI</option>
        </select>

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
                {new Date(m.mating_date).toLocaleString()}
              </div>

              {m.male_name && (
                <div className="text-sm">Male: {m.male_name}</div>
              )}

              {m.method && (
                <div className="text-sm">Method: {m.method}</div>
              )}

              {m.notes && (
                <div className="text-sm italic">{m.notes}</div>
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

import {
  createProgesteroneTest,
  deleteProgesteroneTest,
  getProgesteroneTests,
} from "@/app/actions/progesterone";

export default async function ProgesteronePage() {
  const tests = await getProgesteroneTests();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Progesterone Tests</h1>

      {/* CREATE FORM */}
      <form
        action={async (formData) => {
          "use server";

          await createProgesteroneTest({
            heat_id: formData.get("heat_id") as string,
            test_date: new Date(
              formData.get("test_date") as string
            ).toISOString(),
            value: Number(formData.get("value")),
            vet_name: formData.get("vet_name") as string,
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
          name="test_date"
          type="datetime-local"
          className="border p-2 w-full"
          required
        />

        <input
          name="value"
          type="number"
          step="0.01"
          placeholder="Progesterone value"
          className="border p-2 w-full"
          required
        />

        <input
          name="vet_name"
          placeholder="Vet name"
          className="border p-2 w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full"
        />

        <button className="bg-black text-white px-4 py-2 rounded">
          Add test
        </button>
      </form>

      {/* LIST */}
      <div className="space-y-3">
        {tests?.map((t) => (
          <div
            key={t.id}
            className="border p-3 rounded flex justify-between items-start"
          >
            <div>
              <div className="font-semibold">
                {t.value} ng/mL
              </div>

              <div className="text-sm text-gray-500">
                {new Date(t.test_date).toLocaleString()}
              </div>

              {t.vet_name && (
                <div className="text-sm">Vet: {t.vet_name}</div>
              )}

              {t.notes && (
                <div className="text-sm italic">{t.notes}</div>
              )}
            </div>

            <form
              action={async () => {
                "use server";
                await deleteProgesteroneTest(t.id);
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
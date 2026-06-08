import {
  createMating,
  deleteMating,
  getMatings,
  type MatingType,
} from "@/app/actions/matings";

export default async function MatingsPage() {
  const matings = await getMatings();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">Matings</h1>

      <form
        action={async (formData) => {
          "use server";

          const matingType =
            (formData.get("mating_type") as MatingType) ||
            "natural";

          await createMating({
            heat_id: formData.get("heat_id") as string,

            mating_type: matingType,

            stud_dog_id:
              (formData.get("stud_dog_id") as string) || undefined,

            outside_stud_name:
              (formData.get("outside_stud_name") as string) ||
              undefined,

            outside_stud_reg_number:
              (formData.get(
                "outside_stud_reg_number"
              ) as string) || undefined,

            first_mating_date:
              formData.get("first_mating_date") as string,

            chase_mating_date:
              (formData.get(
                "chase_mating_date"
              ) as string) || undefined,

            notes:
              (formData.get("notes") as string) || undefined,
          });
        }}
        className="space-y-3 border rounded p-4"
      >
        <input
          name="heat_id"
          placeholder="Heat ID"
          required
          className="border p-2 w-full"
        />

        <select
          name="mating_type"
          className="border p-2 w-full"
        >
          <option value="natural">Natural</option>
          <option value="ai_chilled">AI Chilled</option>
          <option value="ai_frozen">AI Frozen</option>
        </select>

        <input
          name="stud_dog_id"
          placeholder="Stud Dog ID"
          className="border p-2 w-full"
        />

        <input
          name="outside_stud_name"
          placeholder="Outside Stud Name"
          className="border p-2 w-full"
        />

        <input
          name="outside_stud_reg_number"
          placeholder="Outside Stud Registration Number"
          className="border p-2 w-full"
        />

        <input
          name="first_mating_date"
          type="date"
          required
          className="border p-2 w-full"
        />

        <input
          name="chase_mating_date"
          type="date"
          className="border p-2 w-full"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Mating
        </button>
      </form>

      <div className="space-y-3">
        {matings.map((m) => (
          <div
            key={m.id}
            className="border rounded p-4 flex justify-between"
          >
            <div className="space-y-1">
              <div className="font-semibold">
                {m.first_mating_date}
              </div>

              <div className="text-sm">
                Type: {m.mating_type}
              </div>

              {m.stud_dog_id && (
                <div className="text-sm">
                  Stud Dog ID: {m.stud_dog_id}
                </div>
              )}

              {m.outside_stud_name && (
                <div className="text-sm">
                  Outside Stud: {m.outside_stud_name}
                </div>
              )}

              {m.outside_stud_reg_number && (
                <div className="text-sm">
                  Registration:{" "}
                  {m.outside_stud_reg_number}
                </div>
              )}

              {m.chase_mating_date && (
                <div className="text-sm">
                  Chase Mating: {m.chase_mating_date}
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
              <button
                type="submit"
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

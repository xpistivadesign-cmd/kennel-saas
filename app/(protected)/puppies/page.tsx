import { getLitters } from "@/app/actions/litters";
import {
  getPuppiesByLitter,
  createPuppy,
  deletePuppy,
} from "@/app/actions/puppies";

export default async function PuppiesPage() {
  const litters = await getLitters();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-2xl font-bold">Puppies 🐶</h1>

      <div className="space-y-6">
        {await Promise.all(
          litters.map(async (litter: any) => {
            const puppies = await getPuppiesByLitter(litter.id);

            return (
              <div key={litter.id} className="border rounded-xl p-4 space-y-4">
                <h2 className="font-bold">
                  Litter {litter.litter_letter} –{" "}
                  {new Date(litter.birth_date).toLocaleDateString()}
                </h2>

                {/* CREATE PUPPY */}
                <form
                  action={async (formData) => {
                    "use server";

                    await createPuppy({
                      litterId: litter.id,
                      name: formData.get("name") as string,
                      sex: formData.get("sex") as any,
                      color: formData.get("color") as string,
                      collarColor: formData.get("collar_color") as string,
                      birthWeight: Number(formData.get("birth_weight")),
                    });
                  }}
                  className="grid grid-cols-2 gap-2"
                >
                  <input
                    name="name"
                    placeholder="Name"
                    className="border p-2"
                  />

                  <select name="sex" className="border p-2">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  <input
                    name="color"
                    placeholder="Color"
                    className="border p-2"
                  />

                  <input
                    name="collar_color"
                    placeholder="Collar"
                    className="border p-2"
                  />

                  <input
                    name="birth_weight"
                    type="number"
                    placeholder="Weight"
                    className="border p-2"
                  />

                  <button className="col-span-2 bg-black text-white py-2 rounded">
                    Add Puppy
                  </button>
                </form>

                {/* LIST */}
                <div className="space-y-2">
                  {puppies.map((p: any) => (
                    <div
                      key={p.id}
                      className="flex justify-between border p-2 rounded"
                    >
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.sex} • {p.status}
                        </div>
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await deletePuppy(p.id);
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
          })
        )}
      </div>
    </div>
  );
}
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const males = dogs?.filter((d) => d.sex === "Male") || [];
  const females = dogs?.filter((d) => d.sex === "Female") || [];

  async function addDog(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const sire = formData.get("sire_id");
    const dam = formData.get("dam_id");

    await supabase.from("dogs").insert({
      user_id: user.id,
      name: String(formData.get("name") || ""),
      breed: String(formData.get("breed") || ""),
      sex: String(formData.get("sex") || ""),
      birth_date: formData.get("birth_date") || null,

      microchip_id: String(formData.get("microchip_id") || ""),
      passport_number: String(formData.get("passport_number") || ""),
      pedigree_number: String(formData.get("pedigree_number") || ""),
      reg_number: String(formData.get("reg_number") || ""),
      color_markings: String(formData.get("color_markings") || ""),

      is_public: formData.get("is_public") === "on",
      is_for_sale: formData.get("is_for_sale") === "on",

      notes: String(formData.get("notes") || ""),

      sire_id: sire === "none" ? null : sire,
      dam_id: dam === "none" ? null : dam,
    });

    revalidatePath("/dogs");
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Dogs</h1>
        <p className="text-zinc-400">Kennel management system</p>
      </div>

      <form
        action={addDog}
        className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <div className="grid md:grid-cols-2 gap-3">
          <input name="name" placeholder="Name" className="input" />
          <input name="breed" placeholder="Breed" className="input" />
          <input name="microchip_id" placeholder="Microchip ID" className="input" />
          <input name="passport_number" placeholder="Passport Number" className="input" />
          <input name="pedigree_number" placeholder="Pedigree Number" className="input" />
          <input name="reg_number" placeholder="Registration Number" className="input" />
          <input name="color_markings" placeholder="Color Markings" className="input" />

          <select name="sex" className="input">
            <option value="">Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input type="date" name="birth_date" className="input" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <select name="sire_id" className="input">
            <option value="none">Select Sire (Father)</option>
            {males.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select name="dam_id" className="input">
            <option value="none">Select Dam (Mother)</option>
            {females.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-6 text-sm">
          <label>
            <input type="checkbox" name="is_public" /> Public
          </label>
          <label>
            <input type="checkbox" name="is_for_sale" /> For Sale
          </label>
        </div>

        <textarea name="notes" placeholder="Notes" className="input" />

        <button className="bg-amber-500 text-black px-4 py-2 rounded-lg">
          Add Dog
        </button>
      </form>

      <div className="space-y-2">
        {dogs?.map((d) => (
          <Link
            key={d.id}
            href={`/dogs/${d.id}`}
            className="block rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/40"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-zinc-400">{d.breed}</p>
              </div>
              <div className="text-sm text-zinc-500">{d.sex}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

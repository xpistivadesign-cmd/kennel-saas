import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DogProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!dog) {
    return (
      <div className="p-10 text-red-400">
        Not found
      </div>
    );
  }

  const { data: sire } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dog.sire_id)
    .maybeSingle();

  const { data: dam } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dog.dam_id)
    .maybeSingle();

  const sireSire = sire?.sire_id
    ? (await supabase.from("dogs").select("*").eq("id", sire.sire_id).maybeSingle()).data
    : null;

  const sireDam = sire?.dam_id
    ? (await supabase.from("dogs").select("*").eq("id", sire.dam_id).maybeSingle()).data
    : null;

  const damSire = dam?.sire_id
    ? (await supabase.from("dogs").select("*").eq("id", dam.sire_id).maybeSingle()).data
    : null;

  const damDam = dam?.dam_id
    ? (await supabase.from("dogs").select("*").eq("id", dam.dam_id).maybeSingle()).data
    : null;

  const { data: medical } = await supabase
    .from("medical_records")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", id)
    .order("date", { ascending: false });

  const renderTab = "overview";

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* HEADER */}
      <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-900/40">
        <h1 className="text-3xl font-bold text-amber-400">
          {dog.name}
        </h1>

        <p className="text-zinc-400">
          {dog.breed}
        </p>
      </div>

      {/* OVERVIEW */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">Sex</div>
          <div className="font-semibold">{dog.sex}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">Microchip</div>
          <div className="font-semibold">{dog.microchip_id || "Unknown"}</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="text-zinc-400 text-sm">Passport</div>
          <div className="font-semibold">{dog.passport_number || "Unknown"}</div>
        </div>

      </div>

      {/* PEDIGREE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Pedigree</h2>

        <div className="grid grid-cols-3 gap-4">

          {/* DOG */}
          <div className="bg-amber-500 text-black p-4 rounded-xl font-bold">
            {dog.name}
          </div>

          {/* PARENTS */}
          <div className="space-y-2">

            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
              {sire?.name || "Unknown"}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
              {dam?.name || "Unknown"}
            </div>

          </div>

          {/* GRANDPARENTS */}
          <div className="space-y-2">

            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-sm">
              {sireSire?.name || "Unknown"}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-sm">
              {sireDam?.name || "Unknown"}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-sm">
              {damSire?.name || "Unknown"}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-2 rounded text-sm">
              {damDam?.name || "Unknown"}
            </div>

          </div>

        </div>
      </div>

      {/* MEDICAL */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Medical Mappa</h2>

        <div className="space-y-2">
          {(medical || []).map((m: any) => (
            <div
              key={m.id}
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex justify-between"
            >
              <div>
                <div className="font-semibold">{m.type}</div>
                <div className="text-sm text-zinc-400">{m.notes}</div>
              </div>

              <div className="text-sm text-zinc-500">
                {m.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHOWS */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-amber-400">Shows & Journal</h2>

        <div className="space-y-2">
          {(shows || []).map((s: any) => (
            <div
              key={s.id}
              className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl"
            >
              <div className="font-semibold">
                {s.show_name} — {s.placement || "No placement"}
              </div>

              <div className="text-sm text-zinc-400">
                {s.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

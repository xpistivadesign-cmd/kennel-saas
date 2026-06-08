import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type PageProps = {
  params: { id: string };
};

export default async function DogProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const dogId = params.id;

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", dogId)
    .single();

  const { data: sire } = dog?.sire_id
    ? await supabase.from("dogs").select("*").eq("id", dog.sire_id).single()
    : { data: null };

  const { data: dam } = dog?.dam_id
    ? await supabase.from("dogs").select("*").eq("id", dog.dam_id).single()
    : { data: null };

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", dogId)
    .order("created_at", { ascending: false });

  const { data: matings } = await supabase
    .from("matings")
    .select("*")
    .eq("stud_dog_id", dogId)
    .order("created_at", { ascending: false });

  const { data: litters } = await supabase
    .from("litters")
    .select("*")
    .eq("mating_id", dogId)
    .order("created_at", { ascending: false });

  const { data: shows } = await supabase
    .from("dog_shows")
    .select("*")
    .eq("dog_id", dogId)
    .order("show_date", { ascending: false });

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("male_id", dogId)
    .order("created_at", { ascending: false });

  const income =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0) || 0;

  const expense =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0) || 0;

  const net = income - expense;

  if (!dog) {
    return <div className="p-6">Dog not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{dog.name}</h1>
          <p className="text-sm text-gray-500">Champion Dog Profile</p>
        </div>

        <Link href="/protected/dogs" className="text-sm underline">
          Back to dogs
        </Link>
      </div>

      {/* TAB 1 - BASIC */}
      <div className="border rounded-xl p-4 space-y-2">
        <h2 className="font-bold">Basic & Pedigree</h2>
        <p>Chip: {dog.chip_number || "-"}</p>

        <p>Sire: {sire?.name || "-"}</p>
        <p>Dam: {dam?.name || "-"}</p>
      </div>

      {/* TAB 2 - BIO */}
      <div className="border rounded-xl p-4 space-y-3">
        <h2 className="font-bold">Biology & Reproduction</h2>

        <div>
          <p className="font-semibold">Heats</p>
          {heats?.length ? (
            heats.map((h) => (
              <div key={h.id} className="text-sm">
                {h.start_date} - {h.status}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No heats</p>
          )}
        </div>

        <div>
          <p className="font-semibold">Matings</p>
          {matings?.length ? (
            matings.map((m) => (
              <div key={m.id} className="text-sm">
                {m.mating_date} - {m.method || "unknown"}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No matings</p>
          )}
        </div>

        <div>
          <p className="font-semibold">Litters</p>
          {litters?.length ? (
            litters.map((l) => (
              <div key={l.id} className="text-sm">
                {l.birth_date || "pending"} - {l.status}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No litters</p>
          )}
        </div>
      </div>

      {/* TAB 3 - SHOWS */}
      <div className="border rounded-xl p-4 space-y-2">
        <h2 className="font-bold">Show Career</h2>

        {shows?.length ? (
          shows.map((s) => (
            <div key={s.id} className="text-sm border-b py-2">
              <div className="font-semibold">{s.show_name}</div>
              <div>
                {s.show_date} — {s.location}
              </div>
              <div>
                Judge: {s.judge_name || "-"} | Class: {s.class || "-"}
              </div>
              <div>
                Placement: {s.placement || "-"} | Titles:{" "}
                {s.titles_won || "-"}
              </div>
              <div className="text-gray-500">{s.notes}</div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No show records</p>
        )}
      </div>

      {/* TAB 4 - FINANCE */}
      <div className="border rounded-xl p-4 space-y-2">
        <h2 className="font-bold">Dog-level P&L</h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 border rounded">
            <p className="text-xs text-gray-500">Income</p>
            <p className="font-bold">{income}</p>
          </div>

          <div className="p-3 border rounded">
            <p className="text-xs text-gray-500">Expense</p>
            <p className="font-bold">{expense}</p>
          </div>

          <div className="p-3 border rounded">
            <p className="text-xs text-gray-500">Net</p>
            <p className="font-bold">{net}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

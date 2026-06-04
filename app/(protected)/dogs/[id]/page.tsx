import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", id)
    .single();

  if (!dog) return notFound();

  const { data: heats } = await supabase
    .from("heats")
    .select("*")
    .eq("dog_id", id)
    .order("start_date", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        🐕 {dog.name}
      </h1>

      <div className="bg-white p-4 border rounded-lg">
        <p>Registry: {dog.registration_number}</p>
        <p>Sex: {dog.sex}</p>
      </div>

      <div className="bg-white p-4 border rounded-lg">
        <h2 className="font-bold mb-2">Breeding history</h2>

        {!heats?.length ? (
          <p className="text-gray-400">No records</p>
        ) : (
          heats.map((h) => (
            <div key={h.id} className="text-sm border-b py-2">
              {h.start_date} → {h.end_date || "active"}
            </div>
          ))
        )}
      </div>

      <Link href="/heats" className="text-blue-600">
        ← back
      </Link>
    </div>
  );
}
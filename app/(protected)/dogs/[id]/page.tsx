export const dynamic = "force-dynamic";

import { createServerSupabase } from "@/lib/supabase/server";
import { getDogWithPedigree } from "@/lib/supabase/pedigree.server";
import PedigreeTree from "@/components/PedigreeTree";

export default async function DogPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!dog) return <div>Dog not found</div>;

  const pedigree = await getDogWithPedigree(params.id, 4);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{dog.name}</h1>

      <div className="text-gray-500">
        {dog.breed} • {dog.gender}
      </div>

      <div className="mt-6">
        <PedigreeTree root={pedigree!} />
      </div>
    </div>
  );
}

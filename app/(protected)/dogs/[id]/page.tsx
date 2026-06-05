import { createServerSupabase } from "@/lib/supabase/server";
import { getDogWithPedigree } from "@/lib/supabase/pedigree.server";
import PedigreeTree from "@/components/PedigreeTree";

type Props = {
  params: { id: string };
};

export default async function DogDetailsPage({ params }: Props) {
  const supabase = createServerSupabase();

  const { data: dog } = await supabase
    .from("dogs")
    .select("*")
    .eq("id", params.id)
    .single();

  const pedigree = await getDogWithPedigree(params.id, 3);

  if (!dog) {
    return <div className="p-6">Dog not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* PROFILE */}
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold">{dog.name}</h1>
        <p className="text-gray-500">{dog.breed}</p>
        <p className="text-sm">
          {dog.gender === "male" ? "♂ Male" : "♀ Female"}
        </p>

        {dog.reg_number && (
          <p className="text-xs text-gray-400">
            Reg: {dog.reg_number}
          </p>
        )}
      </div>

      {/* PEDIGREE */}
      {pedigree && (
        <div className="border rounded-xl bg-gray-50">
          <PedigreeTree root={pedigree} />
        </div>
      )}
    </div>
  );
}

import { PedigreeNode } from "@/lib/supabase/dogs";

function NodeBox({ dog }: { dog: any }) {
  if (!dog) return <div className="p-2 border">—</div>;

  return (
    <div className="p-2 border rounded bg-white shadow">
      <div className="font-bold">{dog.name}</div>
      <div className="text-sm text-gray-500">{dog.breed}</div>
    </div>
  );
}

export default function PedigreeTree({
  data,
}: {
  data: PedigreeNode | null;
}) {
  if (!data) return <div>Nincs adat</div>;

  return (
    <div className="space-y-4">

      {/* GENERATION 1 */}
      <div className="flex justify-center">
        <NodeBox dog={data} />
      </div>

      {/* GENERATION 2 */}
      <div className="flex justify-around">
        <NodeBox dog={data.sire} />
        <NodeBox dog={data.dam} />
      </div>

      {/* GENERATION 3 */}
      <div className="flex justify-around">
        <div className="flex gap-2">
          <NodeBox dog={data.sire?.sire} />
          <NodeBox dog={data.sire?.dam} />
        </div>

        <div className="flex gap-2">
          <NodeBox dog={data.dam?.sire} />
          <NodeBox dog={data.dam?.dam} />
        </div>
      </div>
    </div>
  );
}

import { getPedigreeTree } from "@/lib/supabase/pedigree.server";
import PedigreeTree from "../components/PedigreeTree";

export default async function DogPage({
  params,
}: {
  params: { id: string };
}) {
  const tree = await getPedigreeTree(params.id);

  if (!tree) return <div>Nincs adat</div>;

  return <PedigreeTree root={tree} />;
}

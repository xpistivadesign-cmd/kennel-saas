// app/(protected)/litters/generator/[matingId]/page.tsx

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createLitter } from "@/app/actions/litters";

interface Props {
  params: { matingId: string };
  searchParams: { kennelId?: string };
}

export default async function LitterGeneratorPage({
  params,
  searchParams,
}: Props) {
  const matingId = params.matingId;
  const kennelId = searchParams?.kennelId ?? "default_kennel";

  // védelem
  if (!matingId) {
    redirect("/mating-planner");
  }

  // létrehozás
  await createLitter({
    mating_id: matingId,
    kennel_id: kennelId,
  });

  // azonnali továbbítás
  redirect("/litters");
}

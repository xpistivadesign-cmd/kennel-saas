// app/(protected)/litters/generator/[matingId]/page.tsx
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createLitter } from "@/app/actions/litters";

interface Props {
  params: Promise<{ matingId: string }> | { matingId: string };
  searchParams: Promise<{ kennelId?: string }> | { kennelId?: string };
}

export default async function LitterGeneratorPage({ params, searchParams }: Props) {
  // Next.js 16/17 kompatibilis aszinkron params feloldás
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const matingId = resolvedParams.matingId;
  const kennelId = resolvedSearchParams.kennelId || "default_kennel";

  if (!matingId) {
    redirect("/mating-planner");
  }

  try {
    // Meghívjuk a tiszta, új Server Action-t, ami a litters.ts-ben van
    await createLitter({
      mating_id: matingId,
      kennel_id: kennelId
    });
  } catch (error) {
    console.error("Litter creation failed:", error);
  }

  // Sikeres létrehozás után azonnal visszadobjuk a felhasználót a tiszta alomlistára
  redirect("/litters");
}

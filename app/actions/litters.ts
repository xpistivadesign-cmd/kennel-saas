// app/actions/litters.ts

"use server";

import { revalidatePath } from "next/cache";

export type LitterStatus = "planned" | "born" | "raised";

export type Litter = {
  id: string;
  mating_id: string;
  kennel_id: string;
  birth_date: string | null;
  puppies_count: number | null;
  status: LitterStatus;
  created_at: string;
};

/**
 * MOCK DB LAYER (replace with Supabase later)
 */
let LITTERS: Litter[] = [
  {
    id: "1",
    mating_id: "m1",
    kennel_id: "k1",
    birth_date: null,
    puppies_count: null,
    status: "planned",
    created_at: new Date().toISOString(),
  },
];

export async function getLitters(): Promise<Litter[]> {
  "use server";
  return LITTERS;
}

export async function markLitterBorn(input: {
  litterId: string;
  puppiesCount: number;
  birthDate?: string;
}) {
  "use server";

  LITTERS = LITTERS.map((l) =>
    l.id === input.litterId
      ? {
          ...l,
          status: "born",
          puppies_count: input.puppiesCount,
          birth_date: input.birthDate ?? new Date().toISOString(),
        }
      : l
  );

  revalidatePath("/litters");
}

export async function createLitter(input: {
  mating_id: string;
  kennel_id: string;
  planned_birth_date?: string;
}) {
  "use server";

  const newLitter: Litter = {
    id: Math.random().toString(36).slice(2),
    mating_id: input.mating_id,
    kennel_id: input.kennel_id,
    birth_date: null,
    puppies_count: null,
    status: "planned",
    created_at: new Date().toISOString(),
  };

  LITTERS.push(newLitter);

  revalidatePath("/litters");
}

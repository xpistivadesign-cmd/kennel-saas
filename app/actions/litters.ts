"use server";

import { revalidatePath } from "next/cache";
import { wrightCOI } from "@/lib/coi/coi.engine";

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

export type PuppyInput = {
  name: string;
  gender: "male" | "female";
  color?: string;
};

type Dog = {
  id: string;
  litter_id: string;
  name: string;
  gender: "male" | "female";
  color?: string;
  sireId: string;
  damId: string;
  coi: number;
};

/**
 * MOCK DB
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

let DOGS: Dog[] = [];

export async function getLitters(): Promise<Litter[]> {
  "use server";
  return LITTERS;
}

/**
 * 🐶 MARK LITTER BORN + CREATE PUPPIES + COI CALC
 */
export async function markLitterBorn(input: {
  litterId: string;
  puppies: PuppyInput[];
  birthDate?: string;
}) {
  "use server";

  const litter = LITTERS.find((l) => l.id === input.litterId);

  if (!litter) {
    throw new Error("Litter not found");
  }

  // 🔬 COI számítás (egyszerűsített mock)
  const coiValue = wrightCOI({
    sireId: litter.mating_id,
    damId: litter.mating_id,
  });

  // 🐶 puppies létrehozása
  const newDogs: Dog[] = input.puppies.map((p) => ({
    id: crypto.randomUUID(),
    litter_id: litter.id,
    name: p.name,
    gender: p.gender,
    color: p.color,
    sireId: litter.mating_id,
    damId: litter.mating_id,
    coi: coiValue,
  }));

  DOGS.push(...newDogs);

  // 🍼 litter update
  LITTERS = LITTERS.map((l) =>
    l.id === input.litterId
      ? {
          ...l,
          status: "born",
          puppies_count: input.puppies.length,
          birth_date: input.birthDate ?? new Date().toISOString(),
        }
      : l
  );

  revalidatePath("/litters");

  return {
    litterId: litter.id,
    puppies: newDogs,
  };
}

/**
 * ➕ SIMPLE CREATE LITTER (nem változott logika)
 */
export async function createLitter(input: {
  mating_id: string;
  kennel_id: string;
}) {
  "use server";

  const newLitter: Litter = {
    id: crypto.randomUUID(),
    mating_id: input.mating_id,
    kennel_id: input.kennel_id,
    birth_date: null,
    puppies_count: null,
    status: "planned",
    created_at: new Date().toISOString(),
  };

  LITTERS.push(newLitter);

  revalidatePath("/litters");

  return newLitter;
}

import { createSupabaseServer } from "./supabase-server";
import type { Dog } from "./types";

export class DogsRepository {
  private supabase = createSupabaseServer();

  async getDogById(id: string, userId: string): Promise<Dog> {
    const { data, error } = await this.supabase
      .from("dogs")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data as Dog;
  }

  async getChildrenBatch(ids: string[]): Promise<Dog[]> {
    if (!ids.length) return [];

    const { data, error } = await this.supabase
      .from("dogs")
      .select("*")
      .in("id", ids);

    if (error) throw new Error(error.message);
    return (data ?? []) as Dog[];
  }

  async getParentsBatch(dogs: Dog[]): Promise<Record<string, Dog | null>> {
    const parentIds = dogs
      .flatMap((d) => [d.sire_id, d.dam_id])
      .filter((id): id is string => Boolean(id));

    const parents = await this.getChildrenBatch(parentIds);

    const map = new Map(parents.map((p) => [p.id, p]));

    const result: Record<string, Dog | null> = {};

    for (const d of dogs) {
      result[`sire:${d.id}`] = d.sire_id ? map.get(d.sire_id) ?? null : null;
      result[`dam:${d.id}`] = d.dam_id ? map.get(d.dam_id) ?? null : null;
    }

    return result;
  }

  async getPedigreeTree(dog: Dog) {
    const parents = await this.getChildrenBatch(
      [dog.sire_id, dog.dam_id].filter(Boolean) as string[]
    );

    const grandParents = await this.getChildrenBatch(
      parents.flatMap((p) => [p.sire_id, p.dam_id]).filter(Boolean) as string[]
    );

    return {
      parents,
      grandParents,
    };
  }
}

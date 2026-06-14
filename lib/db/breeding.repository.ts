import { createSupabaseServer } from "./supabase-server";
import type { Heat, Mating, Litter } from "./types";

export class BreedingRepository {
  private supabase = createSupabaseServer();

  async getHeats(dogId: string): Promise<Heat[]> {
    const { data, error } = await this.supabase
      .from("heats")
      .select("*")
      .eq("dog_id", dogId)
      .order("start_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Heat[];
  }

  async getMatings(dogId: string): Promise<Mating[]> {
    const { data, error } = await this.supabase
      .from("matings")
      .select("*")
      .eq("female_id", dogId)
      .order("date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Mating[];
  }

  async getLitters(dogId: string): Promise<Litter[]> {
    const { data, error } = await this.supabase
      .from("litters")
      .select("*")
      .eq("dam_id", dogId)
      .order("birth_date", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as Litter[];
  }
}

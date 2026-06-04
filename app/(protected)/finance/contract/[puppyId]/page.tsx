import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContractClient from "./ContractClient";

interface PageProps {
  params: {
    puppyId: string;
  };
}

export default async function ContractPage({
  params,
}: PageProps) {
  const supabase = createClient();

  // Bejelentkezett felhasználó
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Kiskutya lekérése
  const { data: puppy, error: puppyError } = await supabase
    .from("puppies")
    .select(`
      id,
      name,
      sex,
      color,
      sale_price,
      buyer_id,
      litter_id
    `)
    .eq("id", params.puppyId)
    .single();

  if (puppyError || !puppy) {
    return notFound();
  }

  // Vevő adatai
  let buyer = null;

  if (puppy.buyer_id) {
    const { data } = await supabase
      .from("buyers")
      .select(`
        full_name,
        phone,
        address
      `)
      .eq("id", puppy.buyer_id)
      .single();

    buyer = data;
  }

  // Tenyésztő adatai (FONTOS: user szűrés!)
  const { data: breeder } = await supabase
    .from("profiles")
    .select(`
      kennel_name,
      full_name,
      address
    `)
    .eq("id", user.id)
    .single();

  // Litters tábla
  // Nem kérünk litter_letter mezőt,
  // mert a sémád alapján nem létezik.
  let litter = null;

  if (puppy.litter_id) {
    const { data } = await supabase
      .from("litters")
      .select(`
        id,
        created_at
      `)
      .eq("id", puppy.litter_id)
      .single();

    litter = data;
  }

  return (
    <ContractClient
      puppy={puppy}
      buyer={buyer}
      breeder={breeder}
      litter={litter}
    />
  );
}
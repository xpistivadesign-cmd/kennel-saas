import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContractClient from "./ContractClient";

export default async function ContractPage({
  params,
}: {
  params: { puppyId: string };
}) {
  const supabase = createClient();

  const { data: puppy } = await supabase
    .from("puppies")
    .select(
      `
      id,
      name,
      sex,
      color,
      sale_price,
      buyer_id,
      litter_id
    `
    )
    .eq("id", params.puppyId)
    .single();

  if (!puppy) return notFound();

  // 🧠 buyer + breeder + litter join
  const { data: buyer } = puppy.buyer_id
    ? await supabase
        .from("profiles")
        .select("full_name, phone, address")
        .eq("id", puppy.buyer_id)
        .single()
    : { data: null };

  const { data: breeder } = await supabase
    .from("profiles")
    .select("kennel_name, full_name, address")
    .eq("id", (await supabase.auth.getUser()).data.user?.id)
    .single();

  const { data: litter } = await supabase
    .from("litters")
    .select("litter_letter, created_at")
    .eq("id", puppy.litter_id)
    .single();

  return (
    <ContractClient
      puppy={puppy}
      buyer={buyer}
      breeder={breeder}
      litter={litter}
    />
  );
}
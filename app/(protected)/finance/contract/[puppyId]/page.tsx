import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContractClient from "./ContractClient";

interface ContractPageProps {
  params: Promise<{
    puppyId: string;
  }>;
}

interface BuyerData {
  name: string | null;
  phone: string | null;
  address: string | null;
}

interface ProfileData {
  full_name?: string | null;
  name?: string | null;
  kennel_name?: string | null;
  kennelName?: string | null;
  address?: string | null;
}

export default async function PuppyContractPage({
  params,
}: ContractPageProps) {
  const { puppyId } = await params;

  const supabase = await createClient();

  // Kiskutya
  const { data: puppy, error } = await supabase
    .from("puppies")
    .select(
      `
      id,
      name,
      sex,
      color,
      sale_price,
      buyer_id,
      litter_id,
      user_id
    `
    )
    .eq("id", puppyId)
    .single();

  if (error || !puppy) {
    return notFound();
  }

  // Vevő
  const { data: buyer } = puppy.buyer_id
    ? await supabase
        .from("buyers")
        .select("name, phone, address")
        .eq("id", puppy.buyer_id)
        .single()
    : { data: null };

  // Tenyésztő profil
  const { data: breeder } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", puppy.user_id)
    .single();

  const typedBuyer = buyer as BuyerData | null;
  const typedBreeder = breeder as ProfileData | null;

  const formattedBuyer = typedBuyer
    ? {
        full_name: typedBuyer.name ?? null,
        phone: typedBuyer.phone ?? null,
        address: typedBuyer.address ?? null,
      }
    : null;

  const formattedBreeder = typedBreeder
    ? {
        full_name:
          typedBreeder.full_name ??
          typedBreeder.name ??
          null,

        kennel_name:
          typedBreeder.kennel_name ??
          typedBreeder.kennelName ??
          null,

        address:
          typedBreeder.address ??
          null,
      }
    : null;

  // Felesleges DB lekérdezés helyett
  const litter = puppy.litter_id
    ? {
        id: puppy.litter_id,
      }
    : null;

  return (
    <ContractClient
      puppy={puppy}
      buyer={formattedBuyer}
      breeder={formattedBreeder}
      litter={litter}
    />
  );
}
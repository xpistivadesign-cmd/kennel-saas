import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ContractClient from "./ContractClient";

interface ContractPageProps {
  params: Promise<{
    puppyId: string;
  }>;
}

export default async function PuppyContractPage({
  params,
}: ContractPageProps) {
  const { puppyId } = await params;
  const supabase = await createClient();

  // 1. PUPPY
  const { data: puppy, error } = await supabase
    .from("puppies")
    .select("id, name, sex, color, sale_price, buyer_id, litter_id, user_id")
    .eq("id", puppyId)
    .single();

  if (error || !puppy) return notFound();

  // 2. BUYER
  const { data: buyer } = puppy.buyer_id
    ? await supabase
        .from("buyers")
        .select("name, phone, address")
        .eq("id", puppy.buyer_id)
        .single()
    : { data: null };

  // 3. BREEDER
  const { data: breeder } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", puppy.user_id)
    .single();

  // 4. NORMALIZÁLÁS (EZ OLDJA MEG A BUILD HIBÁT)
  const formattedBuyer = buyer
    ? {
        full_name: buyer.name ?? undefined,
        phone: buyer.phone ?? undefined,
        address: buyer.address ?? undefined,
      }
    : null;

  const formattedBreeder = breeder
    ? {
        full_name:
          (breeder as any).full_name ??
          (breeder as any).name ??
          undefined,
        kennel_name:
          (breeder as any).kennel_name ??
          (breeder as any).kennelName ??
          undefined,
        address: (breeder as any).address ?? undefined,
      }
    : null;

  const litter = puppy.litter_id
    ? {
        id: puppy.litter_id,
        created_at: undefined,
      }
    : null;

  return (
    <ContractClient
      puppy={{
        id: puppy.id,
        name: puppy.name ?? "",
        sex: puppy.sex ?? "",
        color: puppy.color ?? "",
        sale_price: puppy.sale_price,
      }}
      buyer={formattedBuyer}
      breeder={formattedBreeder}
      litter={litter}
    />
  );
}
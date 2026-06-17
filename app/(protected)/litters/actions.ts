"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  
  const letter = String(formData.get("letter") || "").trim();
  const birthDate = formData.get("birth_date") ? String(formData.get("birth_date")) : null;
  const rawStatus = String(formData.get("status") || "Tervezett").trim();
  const sireId = formData.get("sire_id");
  const damId = formData.get("dam_id");
  
  let sireName = formData.get("sire_name") ? String(formData.get("sire_name")).trim() : "";
  let damName = formData.get("dam_name") ? String(formData.get("dam_name")).trim() : "";

  // Ha nem külső szülőt választott, próbáljuk meg kiszedni az id alapján a nevét
  if (sireId && sireId !== "null" && sireId !== "other") {
    const { data: sDog } = await supabase.from("dogs").select("name").eq("id", sireId).single();
    if (sDog) sireName = sDog.name;
  }
  if (damId && damId !== "null" && damId !== "other") {
    const { data: dDog } = await supabase.from("dogs").select("name").eq("id", damId).single();
    if (dDog) damName = dDog.name;
  }

  const { error } = await supabase.from("litters").insert({
    letter: letter,
    birth_date: birthDate,
    status: rawStatus,
    user_id: user?.id || null,
    female_count: 0,
    male_count: 0,
    sire_name: sireName || null,
    dam_name: damName || null
  });

  if (error) return redirect(`/litters?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/litters");
  return redirect("/litters");
}

export async function markLitterAsBornAction(litterId: string, actualBirthDate: string) {
  const supabase = createSupabaseServer();
  await supabase.from("litters").update({ status: "Ellés", birth_date: actualBirthDate }).eq("id", litterId);
  revalidatePath("/litters");
}

export async function deleteLitterAction(litterId: string) {
  const supabase = createSupabaseServer();
  await supabase.from("litters").delete().eq("id", litterId);
  revalidatePath("/litters");
}

export async function addPuppyAction(data: { 
  litter_id: string; 
  name: string;
  collar_color: string; 
  gender: string; 
  weight_unit: string; 
  birth_weight: number 
}) {
  const supabase = createSupabaseServer();
  
  const { data: newPuppy, error } = await supabase
    .from("puppies")
    .insert({
      litter_id: data.litter_id,
      name: data.name,
      collar_color: data.collar_color,
      gender: data.gender,
      birth_weight: data.birth_weight,
      weight_unit: data.weight_unit,
      status: "Elérhető"
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/litters");
  return newPuppy;
}

export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));

  await supabase.from("puppies").update({ buyer_name, sale_price, status: "Sold" }).eq("id", puppyId);
  try {
    await supabase.from("finances").insert({
      user_id: user?.id,
      title: `Kiskutya eladás (${buyer_name})`,
      amount: sale_price,
      type: "income",
      date: new Date().toISOString().split("T")[0]
    });
  } catch (e) {}
  revalidatePath("/litters");
}

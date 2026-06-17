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

  if (sireId && sireId !== "null" && sireId !== "other") {
    const { data: sDog } = await supabase.from("dogs").select("name").eq("id", sireId).single();
    if (sDog) sireName = sDog.name;
  }
  if (damId && damId !== "null" && damId !== "other") {
    const { data: dDog } = await supabase.from("dogs").select("name").eq("id", damId).single();
    if (dDog) damName = dDog.name;
  }

  const { error } = await supabase.from("litters").insert({
    letter, birth_date: birthDate, status: rawStatus, user_id: user?.id || null,
    female_count: 0, male_count: 0, sire_name: sireName || null, dam_name: damName || null
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
  litter_id: string; name: string; collar_color: string; gender: string; weight_unit: string; birth_weight: number 
}) {
  const supabase = createSupabaseServer();
  const { data: newPuppy, error } = await supabase.from("puppies").insert({
    litter_id: data.litter_id, name: data.name, collar_color: data.collar_color,
    gender: data.gender, birth_weight: data.birth_weight, weight_unit: data.weight_unit, status: "Elérhető"
  }).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/litters");
  return newPuppy;
}

// KISKUTYA PROFIL MENTÉSE
export async function updatePuppyProfileAction(puppyId: string, data: any) {
  const supabase = createSupabaseServer();
  const { error } = await supabase.from("puppies").update({
    name: data.name, collar_color: data.collar_color, gender: data.gender,
    birth_weight: data.birth_weight, weight_unit: data.weight_unit,
    pedigree_number: data.pedigree_number || null, microchip_number: data.microchip_number || null,
    passport_number: data.passport_number || null, notes: data.notes || null
  }).eq("id", puppyId);
  if (error) throw new Error(error.message);
  revalidatePath("/litters");
}

// OLTÁS HOZZÁADÁSA (AKÁR TELJES ALOMRA IS)
export async function addVaccinationAction(data: { vaccine_name: string; date: string; litter_id?: string; puppy_id?: string }) {
  const supabase = createSupabaseServer();
  if (data.litter_id) {
    const { data: pups } = await supabase.from("puppies").select("id").eq("litter_id", data.litter_id);
    if (pups && pups.length > 0) {
      const inserts = pups.map(p => ({ litter_id: data.litter_id, puppy_id: p.id, vaccine_name: data.vaccine_name, date_administered: data.date }));
      await supabase.from("puppy_vaccinations").insert(inserts);
    }
  } else if (data.puppy_id) {
    await supabase.from("puppy_vaccinations").insert({ puppy_id: data.puppy_id, vaccine_name: data.vaccine_name, date_administered: data.date });
  }
  revalidatePath("/litters");
}

// JAVÍTOTT FINANCES SZINKRONIZÁCIÓ (.CATCH ELTÁVOLÍTVA)
export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));

  await supabase.from("puppies").update({ buyer_name, sale_price, status: "Sold" }).eq("id", puppyId);
  
  const finData = {
    user_id: user?.id, title: `Kiskutya eladás (${buyer_name})`,
    amount: sale_price, type: "income", date: new Date().toISOString().split("T")[0]
  };

  const { error: fErr } = await supabase.from("finances").insert(finData);
  
  // Ha a fő tábla hibát ad, megpróbáljuk az egyes számú verziót egy tiszta try-catch blokkban
  if (fErr) {
    try {
      await supabase.from("finance").insert(finData);
    } catch (e) {
      console.error("Nem sikerült a pénzügyi táblákba menteni:", e);
    }
  }
  
  revalidatePath("/litters");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const rawSireId = formData.get("sire_id") ? String(formData.get("sire_id")) : "null";
  const rawDamId = formData.get("dam_id") ? String(formData.get("dam_id")) : "null";

  // Összerakjuk a kötelező alapmezőket, amik biztosan benne vannak a táblában
  let basePayload: any = {
    letter: String(formData.get("letter") || "").trim(),
    status: String(formData.get("status") || "Planning"),
  };

  // Opcionális mezők listája – ezeket egyenként fogjuk letesztelni!
  const optionalFields: any = {
    birth_date: formData.get("birth_date") ? String(formData.get("birth_date")) : null,
    notes: String(formData.get("notes") || ""),
    user_id: user?.id || null,
    sire_name: formData.get("sire_name") ? String(formData.get("sire_name")) : null,
    dam_name: formData.get("dam_name") ? String(formData.get("dam_name")) : null
  };

  if (rawSireId !== "null" && rawSireId !== "other" && rawSireId.trim() !== "") {
    optionalFields.sire_id = rawSireId;
  }
  if (rawDamId !== "null" && rawDamId !== "other" && rawDamId.trim() !== "") {
    optionalFields.dam_id = rawDamId;
  }

  // Megnézzük a biztonság kedvéért, melyik opcionális mezőt eszi meg a Supabase
  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== null && value !== "") {
      try {
        // Próba-beszúrás, hogy létezik-e az oszlop
        const testPayload = { ...basePayload, [key]: value };
        const { error } = await supabase.from("litters").insert(testPayload).select("id");
        
        if (!error) {
          // Ha nem dobott hibát, akkor ez az oszlop létezik! Hozzáadjuk az alapcsomaghoz.
          basePayload[key] = value;
          
          // Mivel a próba sikeresen beszúrta a teszt rekordot, gyorsan töröljük is ki a tesztet,
          // hogy ne szemeteljük tele az adatbázist
          await supabase.from("litters").delete().is([key], value).eq("letter", basePayload.letter);
        }
      } catch (e) {
        // Ha elszállt, akkor az az oszlop nem létezik, simán kihagyjuk
      }
    }
  }

  // MOST JÖN A VÉGLEGES, GARANTÁLT MENTÉS
  let success = false;
  let finalErrorMessage = "";

  try {
    const { error } = await supabase.from("litters").insert(basePayload);
    if (!error) {
      success = true;
    } else {
      finalErrorMessage = error.message;
    }
  } catch (err: any) {
    finalErrorMessage = err?.message || "Ismeretlen hiba";
  }

  // Ha még így is gond lenne (pl. RLS miatt)
  if (!success) {
    return redirect(`/litters?error=${encodeURIComponent(finalErrorMessage || "Database insert failed")}`);
  }

  revalidatePath("/litters");
  return redirect("/litters");
}

export async function addPuppyAction(litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const payload = {
    litter_id: litterId,
    collar_color: String(formData.get("collar_color") || ""),
    gender: String(formData.get("gender")),
    birth_weight: parseInt(String(formData.get("birth_weight") || "0")),
    current_status: "Available"
  };
  const { error } = await supabase.from("puppies").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath(`/litters?id=${litterId}`);
}

export async function sellPuppyAction(puppyId: string, litterId: string, formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const buyer_name = String(formData.get("buyer_name"));
  const sale_price = parseFloat(String(formData.get("sale_price") || "0"));
  const collar = String(formData.get("collar_color") || "Nyakörv nélküli");

  await supabase.from("puppies").update({
    buyer_name,
    buyer_email: String(formData.get("buyer_email") || ""),
    buyer_phone: String(formData.get("buyer_phone") || ""),
    sale_price,
    current_status: "Sold"
  }).eq("id", puppyId);

  const financePayload = {
    user_id: user?.id,
    title: `Alom eladás: ${collar} kiskutya (${buyer_name})`,
    amount: sale_price,
    type: "income",
    date: new Date().toISOString().split("T")[0]
  };

  try { await supabase.from("finances").insert(financePayload); } catch (e) {
    try { await supabase.from("finance").insert(financePayload); } catch (err) {}
  }
  revalidatePath(`/litters?id=${litterId}`);
}

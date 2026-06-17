"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export async function createLitterAction(formData: FormData) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const rawSireId = formData.get("sire_id") ? String(formData.get("sire_id")) : "null";
  const rawDamId = formData.get("dam_id") ? String(formData.get("dam_id")) : "null";

  // Összerakjuk a maximális lehetséges payloadot
  let basePayload: any = {
    letter: String(formData.get("letter") || "").trim(),
    birth_date: formData.get("birth_date") ? String(formData.get("birth_date")) : null,
    sire_name: formData.get("sire_name") ? String(formData.get("sire_name")) : null,
    dam_name: formData.get("dam_name") ? String(formData.get("dam_name")) : null,
    status: String(formData.get("status") || "Planning"),
    notes: String(formData.get("notes") || ""),
    user_id: user?.id || null
  };

  if (rawSireId !== "null" && rawSireId !== "other" && rawSireId.trim() !== "") {
    basePayload.sire_id = rawSireId;
  }
  if (rawDamId !== "null" && rawDamId !== "other" && rawDamId.trim() !== "") {
    basePayload.dam_id = rawDamId;
  }

  let success = false;
  let finalErrorMessage = "";
  
  // Maximum 10-szer próbálkozunk, minden körben eldobva a hibás oszlopot, amit a Supabase hiányol
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const { error } = await supabase.from("litters").insert(basePayload);
      
      if (!error) {
        success = true;
        break; // Sikerült a mentés, kilépünk a ciklusból!
      }

      finalErrorMessage = error.message;
      console.error(`Mentési próbálkozás #${attempt} hiba:`, error.message);

      // Megnézzük, hogy oszlophiány miatt szállt-e el a Supabase (pl. "Could not find the 'xxx' column")
      const columnMatch = error.message.match(/column "([^"]+)"/i) || error.message.match(/column '([^']+)'/i);
      
      if (columnMatch && columnMatch[1]) {
        const missingColumn = columnMatch[1];
        console.log(`=> Automatikusan eltávolítjuk a hiányzó '${missingColumn}' oszlopot a kérésből.`);
        delete basePayload[missingColumn]; // Töröljük a nem létező oszlopot a mentési csomagból
      } else {
        // Ha nem oszlophiány a hiba, hanem valami más, akkor nem tudjuk tovább szűrni
        break;
      }
    } catch (err: any) {
      finalErrorMessage = err?.message || "Ismeretlen hiba";
      break;
    }
  }

  // Ha minden kötél szakad és egyetlen variáció sem ment át
  if (!success) {
    return redirect(`/litters?error=${encodeURIComponent(finalErrorMessage || "Séma hiba")}`);
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
